<?php

namespace App\Mail;

use App\Models\EmailTemplate;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DynamicEmail extends Mailable
{
    use Queueable, SerializesModels;

    public string $renderedSubject;
    public string $renderedBody;

    public function __construct(
        public string $templateSlug,
        public array $data = []
    ) {
        // Add common company data
        $this->data = array_merge([
            'company_name' => Setting::get('company_name', 'AviLegal'),
            'company_email' => Setting::get('company_email', ''),
            'company_phone' => Setting::get('company_phone', ''),
            'dashboard_url' => Setting::get('frontend_url', config('app.url')) . '/dashboard',
        ], $data);

        // Get template and render
        $template = EmailTemplate::getBySlug($templateSlug);
        
        if ($template) {
            $rendered = $template->render($this->data);
            $this->renderedSubject = $rendered['subject'];
            $this->renderedBody = $rendered['body'];
        } else {
            // Fallback if template not found
            $this->renderedSubject = 'Notification from ' . $this->data['company_name'];
            $this->renderedBody = 'This is an automated notification.';
        }
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->renderedSubject,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.dynamic',
            with: [
                'body' => $this->renderedBody,
                'companyName' => $this->data['company_name'],
                'companyEmail' => $this->data['company_email'],
                'companyPhone' => $this->data['company_phone'],
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
