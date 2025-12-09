<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class MailConfigServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Only run if settings table exists
        if (!Schema::hasTable('settings')) {
            return;
        }

        try {
            // Get SMTP settings from database
            $smtpHost = Setting::get('smtp_host');
            $smtpPort = Setting::get('smtp_port');
            $smtpUsername = Setting::get('smtp_username');
            $smtpPassword = Setting::get('smtp_password');
            $smtpEncryption = Setting::get('smtp_encryption');
            $smtpFromAddress = Setting::get('smtp_from_address');
            $smtpFromName = Setting::get('smtp_from_name');

            // Only configure if SMTP host is set
            if ($smtpHost) {
                Config::set('mail.default', 'smtp');
                Config::set('mail.mailers.smtp.host', $smtpHost);
                Config::set('mail.mailers.smtp.port', $smtpPort ?: 587);
                Config::set('mail.mailers.smtp.username', $smtpUsername);
                Config::set('mail.mailers.smtp.password', $smtpPassword);
                Config::set('mail.mailers.smtp.encryption', $smtpEncryption ?: 'tls');
                
                if ($smtpFromAddress) {
                    Config::set('mail.from.address', $smtpFromAddress);
                }
                if ($smtpFromName) {
                    Config::set('mail.from.name', $smtpFromName);
                }
            }
        } catch (\Exception $e) {
            // Silently fail if there's an issue reading settings
        }
    }
}
