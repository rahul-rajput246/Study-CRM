<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudySchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'topic_id',
        'title',
        'scheduled_date',
        'start_time',
        'end_time',
        'estimated_minutes',
        'priority',
        'recurrence',
        'status',
        'reminder_enabled',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'reminder_enabled' => 'boolean',
            'estimated_minutes' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function studySessions(): HasMany
    {
        return $this->hasMany(StudySession::class);
    }
}

