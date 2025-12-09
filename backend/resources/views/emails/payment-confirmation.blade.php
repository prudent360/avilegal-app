<x-mail::message>
# Payment Confirmed ✓

Dear {{ $userName }},

Your payment has been successfully processed. Here are the details:

<x-mail::table>
| Detail | Information |
|:-------|:------------|
| Amount | ₦{{ $amount }} |
| Reference | {{ $reference }} |
| Gateway | {{ $gateway }} |
| Date | {{ $paidAt }} |
</x-mail::table>

**Application Details:**
- **Service:** {{ $serviceName }}
- **Company Name:** {{ $companyName }}

Your application has been submitted and is now being processed. You can track its progress from your dashboard.

<x-mail::button :url="$frontendUrl . '/dashboard/applications'">
View Application
</x-mail::button>

Thank you for choosing {{ $companyInfo['name'] }}.

Best regards,<br>
**{{ $companyInfo['name'] }} Team**

@if($companyInfo['email'])
📧 {{ $companyInfo['email'] }}
@endif
@if($companyInfo['phone'])
📞 {{ $companyInfo['phone'] }}
@endif
</x-mail::message>
