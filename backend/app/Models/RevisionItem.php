<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RevisionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'topic_id',
        'concept_prompt',
        'key_takeaways',
        'confidence_score',
        'repetition_count',
        'interval_days',
        'ease_factor',
        'next_revision_date',
        'last_revised_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'confidence_score' => 'integer',
            'repetition_count' => 'integer',
            'interval_days' => 'integer',
            'ease_factor' => 'decimal:2',
            'next_revision_date' => 'date',
            'last_revised_at' => 'date',
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

    public function logs(): HasMany
    {
        return $this->hasMany(RevisionLog::class)->latest('created_at');
    }
}

