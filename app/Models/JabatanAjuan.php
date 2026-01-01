<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class JabatanAjuan extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'jabatan_ajuan';

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;

    protected $fillable = [
        'pegawai_id',
        'jabatan_lama_id',
        'jabatan_baru_id',
        'alasan',
        'status',
        'acc_by',
        'acc_at',
        'catatan_acc',
    ];

    protected $casts = [
        'acc_at' => 'datetime',
        'status' => 'string',
    ];

    /**
     * Get the employee who made the request
     */
    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'pegawai_id');
    }

    /**
     * Get the old position
     */
    public function jabatanLama()
    {
        return $this->belongsTo(Jabatan::class, 'jabatan_lama_id');
    }

    /**
     * Get the new position being requested
     */
    public function jabatanBaru()
    {
        return $this->belongsTo(Jabatan::class, 'jabatan_baru_id');
    }

    /**
     * Get the user who approved/rejected the request
     */
    public function accBy()
    {
        return $this->belongsTo(Akun::class, 'acc_by');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved requests
     */
    public function scopeDiterima($query)
    {
        return $query->where('status', 'diterima');
    }

    /**
     * Scope for rejected requests
     */
    public function scopeDitolak($query)
    {
        return $query->where('status', 'ditolak');
    }

    /**
     * Check if request is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if request is approved
     */
    public function isDiterima(): bool
    {
        return $this->status === 'diterima';
    }

    /**
     * Check if request is rejected
     */
    public function isDitolak(): bool
    {
        return $this->status === 'ditolak';
    }
}

