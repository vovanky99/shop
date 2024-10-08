<?php

namespace App\Models;

use CyrildeWit\EloquentViewable\Contracts\Viewable;
use CyrildeWit\EloquentViewable\InteractsWithViews;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model implements Viewable
{
    use InteractsWithViews;
    protected $table = 'shop';
    protected $fillable = [
        'name',
        'logo',
        'status',
        'img_cover',
        'descriptions',
        'address_id',
        'seller_id',
        'pin_code',
    ];
    public function messages(){
        return $this->hasMany(MessagesShop::class,'shop_id');
    }
    public function sellers(){
        return $this->hasMany(Seller::class,'shop_id');
    }
    public function seller(){
        return $this->belongsTo(Seller::class,'seller_id');
    }
    public function products(){
        return $this->hasMany(Products::class,'shop_id');
    }
    public function follow_shops(){
        return $this->hasMany(FollowShop::class,'shop_id');
    }
    public function address(){
        return $this->belongsTo(Address::class,'address_id');
    }
    public function shop_shipping_methods(){
        return $this->hasMany(ShopShippingMethod::class,'shop_id');
    }
    public function tax_shop(){
        return $this->hasOne(TaxShop::class,'shop_id');
    }
}