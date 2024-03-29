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
        Schema::create('reviews', function (Blueprint $table) {
            $table->bigIncrements('id')->Unique();
            $table->string('title',50);
            $table->longText('content_reviews',500);
            $table->double('reviews_stars',5);
            $table->integer('parent_id')->nullable();
            $table->foreignId('users_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreignId('products_id')->references('id')->on('products')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};