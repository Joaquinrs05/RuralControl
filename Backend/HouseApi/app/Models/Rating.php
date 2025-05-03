<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'rural_house_id',
        'rating',
    ];

    // Relación con la casa rural
    public function House()
    {
        return $this->belongsTo(House::class);
    }

    // (Opcional) relación con usuario si más adelante los conectas
    // public function user()
    // {
    //     return $this->belongsTo(User::class);
    // }
}
