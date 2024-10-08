<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaxShop extends Model
{
    protected $table ='tax_shop';
    protected $fillable = [
        'type',
        'business_name',
        'tax_code',
        'registered_business_address_id',
        'shop_id',
    ];
    public function shop(){
        return $this->belongsTo(Shop::class,'shop_id');
    }
    public function email_receive_electronic_invoice(){
        return $this->hasMany(EmailReceiveElectronicInvoice::class,'tax_shop_id');
    }
}