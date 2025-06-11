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

    // Relación con valoraciones
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    // (Opcional) relación con el propietario si algún día conectas con el microservicio de usuarios
    // public function owner()
    // {
    //     return $this->belongsTo(User::class, 'owner_id');
    // }
}
