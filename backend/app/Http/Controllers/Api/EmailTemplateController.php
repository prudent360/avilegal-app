<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Mail\DynamicEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmailTemplateController extends Controller
{
    /**
     * Get all email templates
     */
    public function index()
    {
        $templates = EmailTemplate::orderBy('name')->get();
        return response()->json($templates);
    }

    /**
     * Get a single template
     */
    public function show($id)
    {
        $template = EmailTemplate::findOrFail($id);
        return response()->json($template);
    }

    /**
     * Update a template
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $template = EmailTemplate::findOrFail($id);
        $template->update($request->only(['subject', 'body', 'is_active']));

        return response()->json([
            'message' => 'Template updated successfully',
            'template' => $template,
        ]);
    }

    /**
     * Reset template to default
     */
    public function reset($id)
    {
        $template = EmailTemplate::findOrFail($id);
        
        // Run the seeder to get default values
        $seeder = new \Database\Seeders\EmailTemplateSeeder();
        $seeder->run();

        // Reload template
        $template->refresh();

        return response()->json([
            'message' => 'Template reset to default',
            'template' => $template,
        ]);
    }

    /**
     * Send a test email using a template
     */
    public function test(Request $request, $id)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $template = EmailTemplate::findOrFail($id);

        // Create sample data for testing
        $sampleData = [
            'user_name' => 'Test User',
            'amount' => '50,000.00',
            'reference' => 'AVL-TEST123',
            'gateway' => 'Paystack',
            'paid_at' => now()->format('F j, Y g:i A'),
            'service_name' => 'Business Name Registration',
            'business_name' => 'Test Company Ltd',
            'status' => 'Processing',
            'milestone_info' => '**Document Review** - We are reviewing your submitted documents',
            'status_message' => 'Your application is being processed.',
            'completed_at' => now()->format('F j, Y'),
            'document_name' => 'International Passport',
            'rejection_reason' => 'The document is blurry. Please upload a clearer image.',
        ];

        try {
            Mail::to($request->email)->send(new DynamicEmail($template->slug, $sampleData));

            return response()->json([
                'success' => true,
                'message' => 'Test email sent to ' . $request->email,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send test email: ' . $e->getMessage(),
            ], 400);
        }
    }
}
