<x-mail::message>
# Application Update

Dear {{ $userName }},

We have an update on your application for **{{ $companyName }}**.

**Current Status:** {{ $status }}

@if($milestone)
<x-mail::panel>
**{{ $milestone['title'] }}**

{{ $milestone['description'] }}
</x-mail::panel>
@endif

@if($statusMessage)
{{ $statusMessage }}
@endif

You can view the full details and track progress on your dashboard.

<x-mail::button :url="$frontendUrl . '/dashboard/applications'">
View Application
</x-mail::button>

If you have any questions about your application, please don't hesitate to contact us.

Best regards,<br>
**{{ $companyInfo['name'] }} Team**

@if($companyInfo['email'])
📧 {{ $companyInfo['email'] }}
@endif
@if($companyInfo['phone'])
📞 {{ $companyInfo['phone'] }}
@endif
</x-mail::message>
