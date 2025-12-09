<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'service_id',
        'company_name',
        'business_type',
        'details',
        'status',
        'admin_notes',
        'submitted_at',
        'completed_at',
    ];

    protected $casts = [
        'details' => 'array',
        'submitted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function milestones()
    {
        return $this->hasMany(Milestone::class)->orderBy('order');
    }

    public function currentMilestone()
    {
        return $this->milestones()->where('status', '!=', 'completed')->first();
    }

    public function progressPercentage(): int
    {
        $total = $this->milestones()->count();
        if ($total === 0) return 0;
        $completed = $this->milestones()->where('status', 'completed')->count();
        return (int) round(($completed / $total) * 100);
    }
}
