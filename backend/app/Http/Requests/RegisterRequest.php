<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'timezone' => ['nullable', 'string', 'timezone'],
            'daily_goal_minutes' => ['nullable', 'integer', 'min:30', 'max:1440'],
            'target_role' => ['nullable', 'string', 'max:255'],
        ];
    }
}

