<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Products extends Model
{
    use HasFactory;
    public $table = 'products';
    protected $fillable = [
        'name',
        'images',
        'status',
        'price',
        'discount',
        'quantities',
        'descriptions',
        'discount_id',
        'category_id',
        'shop_id',
    ];
    public function reviews(){
        return $this->hasMany(Reviews::class,'products_id','id');
    }
    public function images(){
        return $this->morphMany(Images::class,'imageable');
    }
    public function attributes_product(){
        return $this->hasMany(AttributeProduct::class,'product_id');
    }
    public function product_type(){
        return $this->hasMany(ProductType::class,'product_id','id');
    }
    public function orders_product(){
        return $this->hasMany(OrderProduct::class,'product_id','id');
    }
    public function categories(){
        return $this->belongsTo(Categories::class,'category_id','id');
    }
    public function shop(){
        return $this->belongsTo(Shop::class,'shop_id','id');
    }
    public function discount(){
        return $this->belongsTo(Discount::class,'discount_id','id');
    }

    public function product(){
        return $this->belongsTo(Products::class,'product_id');
    }
}