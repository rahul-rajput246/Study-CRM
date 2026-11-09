<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'timezone' => $this->timezone,
            'daily_goal_minutes' => $this->daily_goal_minutes,
            'target_role' => $this->target_role,
            'avatar' => $this->avatar,
            'bio' => $this->bio,
            'custom_settings' => $this->custom_settings ?: [
                'pomodoro_minutes' => 25,
                'short_break_minutes' => 5,
                'long_break_minutes' => 15,
                'sound_alerts' => true,
                'auto_start_breaks' => false,
                'sm2_default_ease' => 2.50,
                'sm2_daily_limit' => 20,
            ],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

