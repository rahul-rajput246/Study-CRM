<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevisionLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'revision_item_id',
        'rating',
        'rating_score',
        'interval_applied',
        'review_notes',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'rating_score' => 'integer',
            'interval_applied' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function revisionItem(): BelongsTo
    {
        return $this->belongsTo(RevisionItem::class);
    }
}

