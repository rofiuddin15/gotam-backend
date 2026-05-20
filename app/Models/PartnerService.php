<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerService extends Model
{
    use HasFactory;

    protected $fillable = [
        'mitra_id',
        'name',
        'description',
        'price',
        'category',
        'is_available',
        'image',
    ];

    public function mitra()
    {
        return $this->belongsTo(User::class, 'mitra_id');
    }
}
