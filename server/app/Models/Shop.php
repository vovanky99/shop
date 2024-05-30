<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Shop extends Model
{
    use HasFactory;
    public $table = 'shop';
    protected $fillable = [
        'name',
        'logo',
        'status',
        'img_cover',
        'descriptions',
        'address_id',
        'user_id',
    ];
    public function messages(){
        return $this->hasMany(MessagesShop::class,'shop_id');
    }
    public function shop_owners(){
        return $this->hasMany(ShopOwner::class,'shop_id');
    }
    public function products(){
        return $this->hasMany(Products::class,'shop_id');
    }
    public function followShops(){
        return $this->hasMany(FollowShop::class,'shop_id');
    }
    public function Address(){
        return $this->belongsTo(Address::class,'address_id');
    }
    
}