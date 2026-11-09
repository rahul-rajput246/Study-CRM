<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyJournal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'journal_date',
        'what_learned',
        'what_understood',
        'what_was_difficult',
        'solved_independently',
        'needs_revision',
        'tomorrow_focus',
        'daily_rating',
    ];

    protected function casts(): array
    {
        return [
            'journal_date' => 'date',
            'daily_rating' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

