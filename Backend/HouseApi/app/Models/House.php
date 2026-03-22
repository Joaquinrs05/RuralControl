<?php

// app/Models/RuralHouse.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class House extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'photo_path',
        'owner_id',
        'average_rating',
        'price_per_night',
        'address',
        'latitude',
        'longitude',
        'province'
    ];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
