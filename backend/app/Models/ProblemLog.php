<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProblemLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'topic_id',
        'title',
        'platform',
        'problem_url',
        'difficulty',
        'pattern',
        'language',
        'time_complexity',
        'space_complexity',
        'initial_understanding',
        'approach',
        'pseudocode',
        'code_solution',
        'test_cases',
        'mistakes_made',
        'key_learnings',
        'independence_level',
        'time_spent_minutes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'time_spent_minutes' => 'integer',
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
}

