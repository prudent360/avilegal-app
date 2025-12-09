<x-mail::message>
{!! \Illuminate\Support\Str::markdown($body) !!}

---

@if($companyEmail || $companyPhone)
<small>
📧 {{ $companyEmail }} | 📞 {{ $companyPhone }}
</small>
@endif
</x-mail::message>
