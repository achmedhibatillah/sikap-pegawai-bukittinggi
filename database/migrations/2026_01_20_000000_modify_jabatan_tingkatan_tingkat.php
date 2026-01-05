<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ubah kolom tingkat dari integer ke string
        Schema::table('jabatan_tingkatan', function (Blueprint $table) {
            $table->string('tingkat')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jabatan_tingkatan', function (Blueprint $table) {
            $table->integer('tingkat')->change();
        });
    }
};


