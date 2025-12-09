<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Milestone extends Model
{
    protected $fillable = [
        'application_id',
        'title',
        'description',
        'status',
        'completed_at',
        'order',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function markComplete(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function markInProgress(): void
    {
        $this->update([
            'status' => 'in_progress',
        ]);
    }
}
