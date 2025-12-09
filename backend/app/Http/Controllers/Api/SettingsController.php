<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Get all settings (admin only for sensitive keys)
     */
    public function index(Request $request)
    {
        $settings = Setting::all()->pluck('value', 'key');
        
        // Mask sensitive keys for display
        $masked = [];
        foreach ($settings as $key => $value) {
            if (str_contains($key, 'secret_key') || str_contains($key, 'SECRET')) {
                $masked[$key] = $value ? '••••••••' . substr($value, -4) : '';
            } else {
                $masked[$key] = $value;
            }
        }
        
        return response()->json($masked);
    }

    /**
     * Get public settings (payment public keys only)
     */
    public function publicConfig()
    {
        return response()->json([
            'paystack_public_key' => Setting::get('paystack_public_key', ''),
            'flutterwave_public_key' => Setting::get('flutterwave_public_key', ''),
            'company_name' => Setting::get('company_name', 'AviLegal'),
            'company_email' => Setting::get('company_email', ''),
            'company_phone' => Setting::get('company_phone', ''),
        ]);
    }

    /**
     * Update settings (admin only)
     */
    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($request->settings as $key => $value) {
            // Don't update if masked value
            if ($value !== null && !str_starts_with($value, '••••')) {
                Setting::set($key, $value);
            }
        }

        return response()->json([
            'message' => 'Settings updated successfully',
        ]);
    }

    /**
     * Get specific setting value
     */
    public function get($key)
    {
        return response()->json([
            'key' => $key,
            'value' => Setting::get($key),
        ]);
    }

    /**
     * Send test email to verify SMTP settings
     */
    public function testEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            // Configure mail on the fly from settings
            $host = Setting::get('smtp_host');
            $port = Setting::get('smtp_port', 587);
            $username = Setting::get('smtp_username');
            $password = Setting::get('smtp_password');
            $encryption = Setting::get('smtp_encryption', 'tls');
            $fromAddress = Setting::get('smtp_from_address');
            $fromName = Setting::get('smtp_from_name', 'AviLegal');

            if (!$host || !$username || !$password) {
                return response()->json([
                    'success' => false,
                    'message' => 'SMTP settings are incomplete. Please configure host, username, and password.',
                ], 400);
            }

            // Set config dynamically
            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.host' => $host,
                'mail.mailers.smtp.port' => $port,
                'mail.mailers.smtp.username' => $username,
                'mail.mailers.smtp.password' => $password,
                'mail.mailers.smtp.encryption' => $encryption ?: null,
                'mail.from.address' => $fromAddress ?: $username,
                'mail.from.name' => $fromName,
            ]);

            // Send test email
            \Illuminate\Support\Facades\Mail::raw(
                "This is a test email from AviLegal.\n\nIf you received this, your SMTP settings are working correctly.\n\nTime: " . now()->toDateTimeString(),
                function ($message) use ($request, $fromName) {
                    $message->to($request->email)
                        ->subject('AviLegal - Test Email');
                }
            );

            return response()->json([
                'success' => true,
                'message' => 'Test email sent successfully to ' . $request->email,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send test email: ' . $e->getMessage(),
            ], 400);
        }
    }
}

