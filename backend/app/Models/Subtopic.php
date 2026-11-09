<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subtopic extends Model
{
    use HasFactory;

    protected $fillable = [
        'topic_id',
        'title',
        'is_completed',
        'order_index',
    ];

    protected function casts(): array
    {
        return [
            'is_completed' => 'boolean',
            'order_index' => 'integer',
        ];
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }
}

