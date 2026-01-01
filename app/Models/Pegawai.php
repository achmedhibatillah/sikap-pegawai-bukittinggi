<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Models\StorageFile;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Akun;
use App\Models\Presensi;
use App\Models\Jabatan;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Pegawai extends Model
{
    use HasFactory;

    protected $table = 'pegawai';

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'nama',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'agama',
        'pendidikan',
        'foto',
        'ktp',
        'npwp',
        'akun_id'
    ];

    protected $casts = [
        'id' => 'string',
        'tanggal_lahir' => 'date',
        'foto' => 'string',
        'ktp' => 'string',
        'npwp' => 'string',
    ];

    /**
     * Auto-generate UUID when creating a new model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (! $model->getKey()) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    /**
     * Relations to storage files
     */
    public function fotoFile(): BelongsTo
    {
        return $this->belongsTo(StorageFile::class, 'foto');
    }

    public function ktpFile(): BelongsTo
    {
        return $this->belongsTo(StorageFile::class, 'ktp');
    }

    public function npwpFile(): BelongsTo
    {
        return $this->belongsTo(StorageFile::class, 'npwp');
    }

    /**
     * Relation to akun
     */
    public function akun(): BelongsTo
    {
        return $this->belongsTo(Akun::class, 'akun_id');
    }

    /**
     * Presensi records related to this pegawai via pivot table pegawai_presensi
     */
    public function presensi(): BelongsToMany
    {
        return $this->belongsToMany(Presensi::class, 'pegawai_presensi', 'pegawai_id', 'presensi_id')
            ->withPivot(['status', 'masuk', 'keluar', 'catatan']);
    }

    /**
     * Jabatan records related to this pegawai via pivot table pegawai_jabatan
     */
    public function jabatans(): BelongsToMany
    {
        return $this->belongsToMany(Jabatan::class, 'pegawai_jabatan', 'pegawai_id', 'jabatan_id')
            ->withPivot(['mulai', 'selesai']);
    }

    /**
     * Get current active jabatan (where selesai is null or in the future)
     */
    public function currentJabatan()
    {
        return $this->belongsToMany(Jabatan::class, 'pegawai_jabatan', 'pegawai_id', 'jabatan_id')
            ->where(function ($query) {
                $query->whereNull('selesai')
                      ->orWhere('selesai', '>=', now()->toDateString());
            })
            ->withPivot(['mulai', 'selesai'])
            ->orderBy('mulai', 'desc')
            ->limit(1);
    }

    /**
     * Get all jabatan history ordered by mulai date descending
     */
    public function jabatanHistory()
    {
        return $this->belongsToMany(Jabatan::class, 'pegawai_jabatan', 'pegawai_id', 'jabatan_id')
            ->withPivot(['mulai', 'selesai'])
            ->orderBy('mulai', 'desc');
    }
}
