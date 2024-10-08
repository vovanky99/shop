<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderProduct extends Model
{
    public $table = 'order_product';
    protected $fillable = [
        'order_id',       
        'product_id',    
    ];
    public function order(){
        return $this->belongsToMany(OrderCart::class,'order_id','id');
    }
    public function products(){
        return $this->belongsToMany(Products::class,'product_id','id');
    }
}