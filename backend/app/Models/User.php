<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'timezone',
        'daily_goal_minutes',
        'target_role',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'daily_goal_minutes' => 'integer',
        ];
    }

    public function roadmaps(): HasMany
    {
        return $this->hasMany(Roadmap::class);
    }

    public function studySchedules(): HasMany
    {
        return $this->hasMany(StudySchedule::class);
    }

    public function studySessions(): HasMany
    {
        return $this->hasMany(StudySession::class);
    }

    public function revisionItems(): HasMany
    {
        return $this->hasMany(RevisionItem::class);
    }

    public function problemLogs(): HasMany
    {
        return $this->hasMany(ProblemLog::class);
    }

    public function studyNotes(): HasMany
    {
        return $this->hasMany(StudyNote::class);
    }

    public function dailyJournals(): HasMany
    {
        return $this->hasMany(DailyJournal::class);
    }

    public function notificationPreference(): HasOne
    {
        return $this->hasOne(NotificationPreference::class);
    }

    public function inAppNotifications(): HasMany
    {
        return $this->hasMany(InAppNotification::class);
    }
}
