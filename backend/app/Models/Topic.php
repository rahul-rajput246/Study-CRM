<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Topic extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'title',
        'description',
        'learning_objectives',
        'priority',
        'estimated_minutes',
        'actual_minutes',
        'status',
        'start_date',
        'target_date',
        'completed_at',
        'order_index',
        'personal_notes',
    ];

    protected function casts(): array
    {
        return [
            'learning_objectives' => 'array',
            'start_date' => 'date',
            'target_date' => 'date',
            'completed_at' => 'datetime',
            'estimated_minutes' => 'integer',
            'actual_minutes' => 'integer',
        ];
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function subtopics(): HasMany
    {
        return $this->hasMany(Subtopic::class)->orderBy('order_index');
    }

    public function studySchedules(): HasMany
    {
        return $this->hasMany(StudySchedule::class);
    }

    public function studySessions(): HasMany
    {
        return $this->hasMany(StudySession::class);
    }

    public function revisionItem(): HasOne
    {
        return $this->hasOne(RevisionItem::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(StudyNote::class);
    }

    public function problemLogs(): HasMany
    {
        return $this->hasMany(ProblemLog::class);
    }
}

