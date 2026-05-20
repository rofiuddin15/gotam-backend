<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_type',
        'tire_type',
        'base_price',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
