<x-mail::message>
# Document {{ $action === 'approved' ? 'Approved ✓' : 'Needs Attention' }}

Dear {{ $userName }},

@if($action === 'approved')
Your document **{{ $documentName }}** has been reviewed and **approved**.

No further action is required for this document.
@else
Your document **{{ $documentName }}** has been reviewed and requires your attention.

<x-mail::panel>
**Reason:** {{ $rejectionReason ?? 'The document did not meet our requirements. Please re-upload a clear, valid document.' }}
</x-mail::panel>

Please log in to your account and upload a new document that addresses the above concern.
@endif

<x-mail::button :url="$frontendUrl . '/dashboard/documents'">
View Documents
</x-mail::button>

If you have any questions, please contact our support team.

Best regards,<br>
**{{ $companyInfo['name'] }} Team**

@if($companyInfo['email'])
📧 {{ $companyInfo['email'] }}
@endif
@if($companyInfo['phone'])
📞 {{ $companyInfo['phone'] }}
@endif
</x-mail::message>
