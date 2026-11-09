<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'in_app_enabled',
        'browser_enabled',
        'lead_time_minutes',
        'notify_upcoming_sessions',
        'notify_overdue_tasks',
        'notify_revision_due',
        'sound_enabled',
    ];

    protected function casts(): array
    {
        return [
            'in_app_enabled' => 'boolean',
            'browser_enabled' => 'boolean',
            'lead_time_minutes' => 'integer',
            'notify_upcoming_sessions' => 'boolean',
            'notify_overdue_tasks' => 'boolean',
            'notify_revision_due' => 'boolean',
            'sound_enabled' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

