<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules\Unique;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shop', function (Blueprint $table) {
            $table->bigIncrements('id')->Unique();
            $table->string('name',50);
            $table->string('logo');
            $table->string('img_cover');
            $table->boolean('status');
            $table->string('descriptions');
            $table->string('address',100);
            $table->foreignId('users_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreignId('street_address_id')->references('id')->on('street_address')->onDelete('cascade');
            $table->foreignId('ward_id')->references('id')->on('ward')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop');
    }
};