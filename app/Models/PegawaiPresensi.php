<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PegawaiPresensi extends Model
{
    protected $table = 'pegawai_presensi';

    // pivot-like table: no auto-incrementing id
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'pegawai_id',
        'presensi_id',
        'status',
        'masuk',
        'keluar',
        'catatan'
    ];

    protected $casts = [
        'pegawai_id' => 'string',
        'presensi_id' => 'string',
        'masuk' => 'string',
        'keluar' => 'string',
    ];
}
