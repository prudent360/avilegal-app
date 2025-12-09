<?php

namespace App\Mail;

use App\Models\Payment;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Payment $payment
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment Confirmed - ' . Setting::get('company_name', 'AviLegal'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.payment-confirmation',
            with: [
                'userName' => $this->payment->user->name,
                'amount' => number_format((float) $this->payment->amount, 2),
                'reference' => $this->payment->reference,
                'serviceName' => $this->payment->application->service->name ?? 'Service',
                'companyName' => $this->payment->application->company_name,
                'paidAt' => $this->payment->paid_at?->format('F j, Y g:i A'),
                'gateway' => ucfirst($this->payment->gateway),
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
