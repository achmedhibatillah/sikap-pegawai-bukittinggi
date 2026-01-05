<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JabatanTingkat extends Model
{
    use HasFactory;

    protected $table = 'jabatan_tingkatan';

    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'integer';
    public $timestamps = false;

    protected $fillable = [
        'tingkat',
        'nama',
        'deskripsi',
        'aktif',
    ];

    protected $casts = [
        'tingkat' => 'integer',
        'aktif' => 'boolean',
    ];

    /**
     * Get all positions for this level
     */
    public function jabatans()
    {
        return $this->hasMany(Jabatan::class, 'jabatan_tingkatan_id');
    }

    /**
     * Scope for active levels only
     */
    public function scopeAktif($query)
    {
        return $query->where('aktif', true);
    }

    /**
     * Scope ordered by tingkat
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('tingkat', 'asc');
    }

    /**
     * Get label for dropdown display
     */
    public function getLabelAttribute(): string
    {
        return "Tingkat {$this->tingkat} - {$this->nama}";
    }
}

