<x-mail::message>
# Welcome to {{ $companyName }}!

Dear {{ $userName }},

Thank you for creating an account with us. We're excited to help you with your business registration and incorporation needs.

With {{ $companyName }}, you can:
- Register your business with CAC
- Get your business name reserved
- Obtain tax clearance and other documents
- Track your application progress in real-time

<x-mail::button :url="$frontendUrl . '/dashboard'">
Go to Dashboard
</x-mail::button>

If you have any questions, feel free to reach out to us.

Best regards,<br>
**{{ $companyName }} Team**

@if($companyEmail)
📧 {{ $companyEmail }}
@endif
@if($companyPhone)
📞 {{ $companyPhone }}
@endif
</x-mail::message>
