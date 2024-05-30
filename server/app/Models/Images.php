<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Images extends Model
{
    use HasFactory;
    public $table = 'images';
    protected $fillable = [
        'name',
        'status',
        'imageable_id',
        'imageable_type',
    ];
    public function imageable(){
        return $this->morphTo();
    }
}