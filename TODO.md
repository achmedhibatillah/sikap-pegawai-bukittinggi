ctl# TODO - Fix Jabatan Column Ambiguous Error

## Masalah
Error `Column 'aktif' in where clause is ambiguous` terjadi karena kolom `aktif` ada di tabel `jabatan` DAN `jabatan_tingkatan`.

## Rencana Perbaikan

### 1. Fix Model Jabatan.php
- [x] Update `scopeAktif()` untuk menggunakan `jabatan.aktif` (prefix tabel)

### 2. Fix Model JabatanTingkat.php
- [x] Update `scopeAktif()` untuk menggunakan `jabatan_tingkatan.aktif` (prefix tabel)

### 3. Fix Frontend pg-jabatan.tsx
- [x] Update interface Jabatan dengan field baru
- [x] Update `getJabatanTingkat()` untuk akses `jabatan.tingkat`

## Status
- [x] TODO
- [x] IN PROGRESS
- [x] DONE
