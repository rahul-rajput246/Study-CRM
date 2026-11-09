<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudySession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'study_schedule_id',
        'topic_id',
        'session_type',
        'planned_minutes',
        'active_seconds',
        'paused_seconds',
        'started_at',
        'ended_at',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'planned_minutes' => 'integer',
            'active_seconds' => 'integer',
            'paused_seconds' => 'integer',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(StudySchedule::class, 'study_schedule_id');
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }
}

