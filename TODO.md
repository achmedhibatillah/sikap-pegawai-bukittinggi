# TODO: Update Tabel Tingkatan - String Conversion

## Task
Perbarui `tingkat` agar di tabel disimpan sebagai string, tapi input tetap number.

## Files to Edit:

### 1. Frontend: `resources/js/pages/dashboard/jabatan.tsx`
- [x] Ubah `TingkatForm.tingkat` dari `string | number` menjadi `string`
- [x] Ubah `handleAddTingkat`: kirim sebagai string (tanpa `Number()`)
- [x] Ubah `handleUpdateTingkat`: kirim sebagai string (tanpa `Number()`)
- [x] Update input `onChange`: hapus `parseInt()`, biarkan nilai string
- [x] Update `openEditTingkatPopup`: gunakan `.toString()`

### 2. Backend: `app/Http/Controllers/JabatanController.php`
- [x] Ubah validasi `tingkat` dari `integer` menjadi `string` di `tingkatStore()`
- [x] Ubah validasi `tingkat` dari `integer` menjadi `string` di `tingkatUpdate()`
- [x] Cast ke string saat create/update

### 3. Model: `app/Models/JabatanTingkat.php`
- [x] Ubah cast `tingkat` dari `integer` menjadi `string`
- [x] Ubah `$keyType` dari `integer` menjadi `string`

### 4. Database Migration: `database/migrations/...`
- [x] Buat migrasi untuk mengubah kolom `tingkat` ke string

## Progress:
- [x] Frontend changes
- [x] Backend changes  
- [x] Model changes
- [x] Migration created

## Steps untuk menjalankan:
```bash
php artisan migrate
npm run build
```

