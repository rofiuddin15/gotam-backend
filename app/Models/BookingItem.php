<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'partner_service_id',
        'name',
        'price',
        'quantity',
        'subtotal',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function partnerService()
    {
        return $this->belongsTo(PartnerService::class);
    }
}
