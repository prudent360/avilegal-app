<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Payment;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Get payment configuration (public keys from settings)
     */
    public function getConfig()
    {
        return response()->json([
            'paystack_public_key' => Setting::get('paystack_public_key', ''),
            'flutterwave_public_key' => Setting::get('flutterwave_public_key', ''),
        ]);
    }

    /**
     * Initialize payment for a service
     */
    public function initialize(Request $request)
    {
        $request->validate([
            'service_id' => 'required|exists:services,id',
            'gateway' => 'required|in:paystack,flutterwave',
            'company_name' => 'required|string|max:255',
            'business_type' => 'nullable|string|max:100',
        ]);

        $user = $request->user();
        $service = Service::findOrFail($request->service_id);
        $reference = 'AVL-' . strtoupper(Str::random(10));

        // Create pending application
        $application = Application::create([
            'user_id' => $user->id,
            'service_id' => $service->id,
            'company_name' => $request->company_name,
            'business_type' => $request->business_type,
            'details' => $request->details ?? [],
            'status' => 'pending_payment',
        ]);

        // Create pending payment record
        $payment = Payment::create([
            'user_id' => $user->id,
            'application_id' => $application->id,
            'amount' => $service->price,
            'reference' => $reference,
            'gateway' => $request->gateway,
            'status' => 'pending',
        ]);

        if ($request->gateway === 'paystack') {
            return $this->initializePaystack($user, $payment, $service);
        } else {
            return $this->initializeFlutterwave($user, $payment, $service);
        }
    }

    /**
     * Initialize Paystack payment
     */
    private function initializePaystack($user, $payment, $service)
    {
        $secretKey = Setting::get('paystack_secret_key');
        $frontendUrl = Setting::get('frontend_url', config('app.frontend_url', 'http://localhost:3003'));

        if (!$secretKey) {
            return response()->json([
                'success' => false,
                'message' => 'Payment gateway not configured. Please contact support.',
            ], 400);
        }

        $response = Http::withToken($secretKey)
            ->post('https://api.paystack.co/transaction/initialize', [
                'email' => $user->email,
                'amount' => $payment->amount * 100, // Paystack uses kobo
                'reference' => $payment->reference,
                'callback_url' => $frontendUrl . '/payment/callback',
                'metadata' => [
                    'payment_id' => $payment->id,
                    'application_id' => $payment->application_id,
                    'service' => $service->name,
                ],
            ]);

        if ($response->successful() && $response->json('status')) {
            return response()->json([
                'success' => true,
                'authorization_url' => $response->json('data.authorization_url'),
                'reference' => $payment->reference,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to initialize payment',
        ], 400);
    }

    /**
     * Initialize Flutterwave payment
     */
    private function initializeFlutterwave($user, $payment, $service)
    {
        $secretKey = Setting::get('flutterwave_secret_key');
        $frontendUrl = Setting::get('frontend_url', config('app.frontend_url', 'http://localhost:3003'));

        if (!$secretKey) {
            return response()->json([
                'success' => false,
                'message' => 'Payment gateway not configured. Please contact support.',
            ], 400);
        }

        $response = Http::withToken($secretKey)
            ->post('https://api.flutterwave.com/v3/payments', [
                'tx_ref' => $payment->reference,
                'amount' => $payment->amount,
                'currency' => 'NGN',
                'redirect_url' => $frontendUrl . '/payment/callback',
                'customer' => [
                    'email' => $user->email,
                    'name' => $user->name,
                    'phonenumber' => $user->phone,
                ],
                'meta' => [
                    'payment_id' => $payment->id,
                    'application_id' => $payment->application_id,
                ],
                'customizations' => [
                    'title' => Setting::get('company_name', 'AviLegal'),
                    'description' => $service->name,
                ],
            ]);

        if ($response->successful() && $response->json('status') === 'success') {
            return response()->json([
                'success' => true,
                'authorization_url' => $response->json('data.link'),
                'reference' => $payment->reference,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to initialize payment',
        ], 400);
    }

    /**
     * Verify payment callback
     */
    public function verify(Request $request)
    {
        $request->validate([
            'reference' => 'required|string',
        ]);

        $payment = Payment::where('reference', $request->reference)->first();

        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Payment not found'], 404);
        }

        if ($payment->status === 'success') {
            return response()->json([
                'success' => true,
                'message' => 'Payment already verified',
                'payment' => $payment->load('application'),
            ]);
        }

        if ($payment->gateway === 'paystack') {
            return $this->verifyPaystack($payment);
        } else {
            return $this->verifyFlutterwave($payment);
        }
    }

    /**
     * Verify Paystack payment
     */
    private function verifyPaystack($payment)
    {
        $secretKey = Setting::get('paystack_secret_key');
        
        $response = Http::withToken($secretKey)
            ->get("https://api.paystack.co/transaction/verify/{$payment->reference}");

        if ($response->successful() && $response->json('data.status') === 'success') {
            $payment->update([
                'status' => 'success',
                'paid_at' => now(),
                'gateway_response' => $response->json('data'),
            ]);

            // Update application status
            $payment->application->update([
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            // Create default milestones
            $this->createDefaultMilestones($payment->application);

            return response()->json([
                'success' => true,
                'message' => 'Payment verified successfully',
                'payment' => $payment->load('application'),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Payment verification failed',
        ], 400);
    }

    /**
     * Verify Flutterwave payment
     */
    private function verifyFlutterwave($payment)
    {
        $secretKey = Setting::get('flutterwave_secret_key');
        
        $response = Http::withToken($secretKey)
            ->get("https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref={$payment->reference}");

        if ($response->successful() && $response->json('data.status') === 'successful') {
            $payment->update([
                'status' => 'success',
                'paid_at' => now(),
                'gateway_response' => $response->json('data'),
            ]);

            // Update application status
            $payment->application->update([
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            // Create default milestones
            $this->createDefaultMilestones($payment->application);

            return response()->json([
                'success' => true,
                'message' => 'Payment verified successfully',
                'payment' => $payment->load('application'),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Payment verification failed',
        ], 400);
    }

    /**
     * Create default milestones for application
     */
    private function createDefaultMilestones($application)
    {
        $milestones = [
            ['title' => 'Payment Received', 'description' => 'Your payment has been confirmed', 'order' => 1, 'status' => 'completed', 'completed_at' => now()],
            ['title' => 'Document Review', 'description' => 'We are reviewing your submitted documents', 'order' => 2, 'status' => 'pending'],
            ['title' => 'Name Reservation', 'description' => 'Reserving your business name with CAC', 'order' => 3, 'status' => 'pending'],
            ['title' => 'Registration Processing', 'description' => 'Processing your registration with CAC', 'order' => 4, 'status' => 'pending'],
            ['title' => 'Certificate Issuance', 'description' => 'Your certificate is being prepared', 'order' => 5, 'status' => 'pending'],
            ['title' => 'Completed', 'description' => 'Your registration is complete', 'order' => 6, 'status' => 'pending'],
        ];

        foreach ($milestones as $milestone) {
            $application->milestones()->create($milestone);
        }
    }

    /**
     * Get payment history for user
     */
    public function history(Request $request)
    {
        $payments = $request->user()
            ->payments()
            ->with('application.service')
            ->latest()
            ->get();

        return response()->json($payments);
    }
}
