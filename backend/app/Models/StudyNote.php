<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'topic_id',
        'study_session_id',
        'title',
        'content_markdown',
        'note_type',
        'tags',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
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

    public function session(): BelongsTo
    {
        return $this->belongsTo(StudySession::class, 'study_session_id');
    }
}

