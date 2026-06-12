<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MitraProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'vehicle_type_capability',
        'is_mobile',
        'status_verified',
        'is_online',
        'lat',
        'lng',
    ];

    protected $casts = [
        'is_mobile' => 'boolean',
        'status_verified' => 'boolean',
        'is_online' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
