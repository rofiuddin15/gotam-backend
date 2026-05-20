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
        'lat',
        'lng',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
