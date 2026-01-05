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
        Schema::create('jabatan_tingkatan', function (Blueprint $table) {
            $table->id();
            $table->integer('tingkat')->unique();
            $table->string('nama', 100);
            $table->string('deskripsi', 255)->nullable();
            $table->boolean('aktif')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jabatan_tingkatan');
    }
};

