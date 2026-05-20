<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlatformEarning extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'total_amount',
        'partner_amount',
        'platform_commission',
        'commission_rate',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
