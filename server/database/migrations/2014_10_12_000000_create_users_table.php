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
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id')->Unique();
            $table->string('name');
            $table->string('username')->Unique();
            $table->string('email')->Unique();
            $table->text('password');
            $table->bigInteger('phone_number');
            $table->string('avatar');
            $table->double('level',10);
            $table->double('status');
            $table->boolean('gender');
            $table->date('birthday');
            $table->string('address');
            $table->datetime('register_date');
            $table->foreignId('decentralization_id')->references('id')->on('decentralization')->onDelete('cascade');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // Procedure
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};