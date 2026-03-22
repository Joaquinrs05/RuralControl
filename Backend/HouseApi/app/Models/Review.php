<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'house_id',
        'rating',
        'comment'
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    protected static function booted()
    {
        static::saved(function ($review) {
            $review->updateHouseRating();
        });

        static::deleted(function ($review) {
            $review->updateHouseRating();
        });
    }

    public function updateHouseRating()
    {
        $avg = self::where('house_id', $this->house_id)->avg('rating') ?? 0;
        House::where('id', $this->house_id)->update(['average_rating' => $avg]);
    }
}
