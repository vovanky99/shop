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
        Schema::create('products', function (Blueprint $table) {
            $table->bigIncrements('id')->Unique();
            $table->string('title',50);
            $table->string('images');
            $table->double('price');
            $table->double('discount',100);
            $table->double('quantities');
            $table->boolean('status');
            $table->string('descriptions');
            $table->foreignId('categories_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreignId('shop_id')->references('id')->on('shop')->onDelete('cascade');
            $table->foreignId('products_type_id')->references('id')->on('products_type')->onDelete('cascade');
            $table->foreignId('products_type_id1')->nullable()->unsigned()->references('id')->on('products_type')->onDelete('cascade');
            $table->foreignId('products_type_id2')->nullable()->unsigned()->references('id')->on('products_type')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};