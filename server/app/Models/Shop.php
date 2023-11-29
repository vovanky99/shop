<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    use HasFactory;
    public $table = 'shop';
    protected $fillable = [
        'name',
        'logo',
        'descriptions',
        'address',
        'users_id',
    ];
    public function users(){
        return $this->belongsTo(User::class,'users_id','id');
    }
    public function products(){
        return $this->hasOne(Products::class,'shop_id','id');
    }
}
