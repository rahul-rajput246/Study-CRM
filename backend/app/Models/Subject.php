<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'phase_id',
        'title',
        'icon',
        'order_index',
        'status',
    ];

    public function phase(): BelongsTo
    {
        return $this->belongsTo(Phase::class);
    }

    public function topics(): HasMany
    {
        return $this->hasMany(Topic::class)->orderBy('order_index');
    }
}

