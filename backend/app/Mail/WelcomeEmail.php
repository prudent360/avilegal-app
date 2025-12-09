<?php

namespace App\Mail;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to ' . Setting::get('company_name', 'AviLegal'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.welcome',
            with: [
                'userName' => $this->user->name,
                'companyName' => Setting::get('company_name', 'AviLegal'),
                'companyEmail' => Setting::get('company_email', ''),
                'companyPhone' => Setting::get('company_phone', ''),
                'frontendUrl' => Setting::get('frontend_url', config('app.url')),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
