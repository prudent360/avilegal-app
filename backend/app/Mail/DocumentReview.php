<?php

namespace App\Mail;

use App\Models\Document;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentReview extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Document $document,
        public string $action // 'approved' or 'rejected'
    ) {}

    public function envelope(): Envelope
    {
        $status = $this->action === 'approved' ? '✓ Approved' : '✗ Needs Attention';
        return new Envelope(
            subject: "Document {$status} - " . $this->document->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.document-review',
            with: [
                'userName' => $this->document->user->name,
                'documentName' => $this->document->name,
                'action' => $this->action,
                'rejectionReason' => $this->document->rejection_reason,
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
