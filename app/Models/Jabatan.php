<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Jabatan extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'jabatan';

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'tingkatan',
        'nama',
        'deskripsi',
        'aktif',
    ];

    protected $casts = [
        'tingkatan' => 'integer',
        'aktif' => 'boolean',
    ];

    /**
     * Get the employees holding this position
     */
    public function pegawais()
    {
        return $this->belongsToMany(Pegawai::class, 'pegawai_jabatan', 'jabatan_id', 'pegawai_id')
            ->withPivot(['mulai', 'selesai']);
    }

    /**
     * Get old position records (for ajuan)
     */
    public function oldPositionRecords()
    {
        return $this->hasMany(JabatanAjuan::class, 'jabatan_lama_id');
    }

    /**
     * Get new position records (for ajuan)
     */
    public function newPositionRecords()
    {
        return $this->hasMany(JabatanAjuan::class, 'jabatan_baru_id');
    }

    /**
     * Scope for active positions only
     */
    public function scopeAktif($query)
    {
        return $query->where('aktif', true);
    }

    /**
     * Scope ordered by tingkatan
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('tingkatan', 'asc');
    }
}

