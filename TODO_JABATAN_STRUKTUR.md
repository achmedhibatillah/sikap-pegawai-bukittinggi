# TODO: Ubah Struktur Tabel Jabatan (Relasi M-1 ke JabatanTingkat)

## Status: IN PROGRESS

### Langkah-langkah:

- [ ] 1. Backup/hapus data jabatan yang ada (jika perlu)
- [ ] 2. Update Migration: ubah `jabatan.tingkatan` jadi foreign key ke `jabatan_tingkatan.id`
- [ ] 3. Update Model JabatanTingkat: ubah primary key ke integer `tingkat`
- [ ] 4. Update Model Jabatan: ubah relasi dan foreign key
- [ ] 5. Update JabatanController: update validasi dan query
- [ ] 6. Update Frontend: type definitions dan dropdown
- [ ] 7. Jalankan migration segar
- [ ] 8. Jalankan seeder untuk tingkat jabatan
- [ ] 9. Test aplikasi

---

## Catatan:
- Tabel `jabatan` akan memiliki `jabatan_tingkatan_id` yang merujuk ke `jabatan_tingkatan.id`
- Primary key `jabatan_tingkatan` diubah dari UUID ke integer `tingkat`
- Data jabatan yang ada akan dihapus/direset karena perubahan struktur

