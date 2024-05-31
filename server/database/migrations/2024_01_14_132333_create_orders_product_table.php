<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders_product', function (Blueprint $table) {
            $table->foreignId('order_id')->unsigned()->references('id')->on('order_cart')->onDelete('cascade');
            $table->foreignId('product_id')->unsigned()->references('id')->on('products')->onDelete('cascade');
            $table->double('quantity');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders_product');
    }
};