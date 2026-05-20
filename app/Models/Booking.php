<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'mitra_id',
        'service_category_id',
        'status',
        'geo_location_user',
        'geo_location_mitra',
        'final_price',
        'notes',
    ];

    protected $casts = [
        'geo_location_user' => 'array',
        'geo_location_mitra' => 'array',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function mitra()
    {
        return $this->belongsTo(User::class, 'mitra_id');
    }

    public function serviceCategory()
    {
        return $this->belongsTo(ServiceCategory::class);
    }

    public function items()
    {
        return $this->hasMany(BookingItem::class);
    }

    public function statusLogs()
    {
        return $this->hasMany(BookingStatusLog::class);
    }

    /**
     * Record a new status log
     */
    public function logStatus($status, $description = null, $metadata = null)
    {
        return $this->statusLogs()->create([
            'status' => $status,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }

    public function transaction()
    {
        return $this->hasOne(Transaction::class);
    }
}
