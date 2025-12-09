<x-mail::message>
# 🎉 Congratulations!

Dear {{ $userName }},

We are thrilled to inform you that your **{{ $serviceName }}** registration is now **complete**!

<x-mail::panel>
**{{ $companyName }}**

Your business has been successfully registered with the Corporate Affairs Commission (CAC).
</x-mail::panel>

**Completion Date:** {{ $completedAt }}

## What's Next?

You can now:
- Download your certificate from your dashboard
- Use your RC number for official purposes
- Open a corporate bank account
- Apply for business permits and licenses

<x-mail::button :url="$frontendUrl . '/dashboard/applications'">
View Certificate
</x-mail::button>

Thank you for choosing {{ $companyInfo['name'] }} for your business registration needs. We wish you the best of success with your new business!

Best regards,<br>
**{{ $companyInfo['name'] }} Team**

@if($companyInfo['email'])
📧 {{ $companyInfo['email'] }}
@endif
@if($companyInfo['phone'])
📞 {{ $companyInfo['phone'] }}
@endif
</x-mail::message>
