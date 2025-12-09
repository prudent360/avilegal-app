<?php

namespace App\Mail;

use App\Models\Application;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RegistrationComplete extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Application $application
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎉 Registration Complete - ' . $this->application->company_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.registration-complete',
            with: [
                'userName' => $this->application->user->name,
                'companyName' => $this->application->company_name,
                'serviceName' => $this->application->service->name ?? 'Service',
                'completedAt' => now()->format('F j, Y'),
                'companyInfo' => [
                    'name' => Setting::get('company_name', 'AviLegal'),
                    'email' => Setting::get('company_email', ''),
                    'phone' => Setting::get('company_phone', ''),
                ],
                'frontendUrl' => Setting::get('frontend_url', config('app.url')),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
