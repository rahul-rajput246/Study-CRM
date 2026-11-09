<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTopicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'learning_objectives' => ['nullable', 'array'],
            'learning_objectives.*' => ['string'],
            'priority' => ['sometimes', 'in:low,medium,high,critical'],
            'estimated_minutes' => ['sometimes', 'integer', 'min:10', 'max:1440'],
            'actual_minutes' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', 'in:not_started,in_progress,completed,needs_revision'],
            'start_date' => ['nullable', 'date'],
            'target_date' => ['nullable', 'date'],
            'personal_notes' => ['nullable', 'string'],
        ];
    }
}

