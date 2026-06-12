<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;

use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles;

    protected static function boot()
    {
        parent::boot();
        static::created(function ($user) {
            $user->wallet()->create([
                'balance' => 0,
                'currency' => 'IDR'
            ]);

            if ($user->role === 'partner') {
                $user->mitraProfile()->create([
                    'vehicle_type_capability' => 'Motor, Mobil',
                    'is_mobile' => true,
                    'status_verified' => false,
                ]);
            }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function mitraProfile()
    {
        return $this->hasOne(MitraProfile::class);
    }

    public function customerBookings()
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    public function mitraBookings()
    {
        return $this->hasMany(Booking::class, 'mitra_id');
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class);
    }

    public function services()
    {
        return $this->hasMany(PartnerService::class, 'mitra_id');
    }

    public function bankAccounts()
    {
        return $this->hasMany(BankAccount::class);
    }
}
