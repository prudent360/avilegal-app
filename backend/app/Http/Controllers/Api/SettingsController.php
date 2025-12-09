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
}
