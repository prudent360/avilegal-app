<?php

namespace App\Mail;

use App\Models\Application;
use App\Models\Milestone;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationStatusUpdate extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Application $application,
        public ?Milestone $milestone = null,
        public string $statusMessage = ''
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Application Update - ' . $this->application->company_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.application-status',
            with: [
                'userName' => $this->application->user->name,
                'companyName' => $this->application->company_name,
                'serviceName' => $this->application->service->name ?? 'Service',
                'status' => ucfirst(str_replace('_', ' ', $this->application->status)),
                'milestone' => $this->milestone ? [
                    'title' => $this->milestone->title,
                    'description' => $this->milestone->description,
                    'status' => $this->milestone->status,
                ] : null,
                'statusMessage' => $this->statusMessage,
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
