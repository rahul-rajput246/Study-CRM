<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'topic_id' => ['nullable', 'exists:topics,id'],
            'title' => ['required', 'string', 'max:255'],
            'scheduled_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'estimated_minutes' => ['nullable', 'integer', 'min:10', 'max:1440'],
            'priority' => ['required', 'in:low,medium,high,critical'],
            'recurrence' => ['nullable', 'in:none,daily,weekly,custom'],
            'reminder_enabled' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string'],
            'force' => ['nullable', 'boolean'], // Allow user to override warning if they deliberately want an overlap
        ];
    }
}

