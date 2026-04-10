# Panduan Simulasi E2E — PPBI Depok Bonsai Platform

> Dokumen ini menjelaskan langkah-langkah simulasi end-to-end untuk tiga peran:
> **Superadmin / Admin**, **Peserta Publik**, dan **Juri**.
>
> Simulasi menggunakan data lokal (Docker). Sesuaikan URL jika menggunakan server lain.

---

## Informasi Akses

| Peran | URL Login | Email | Password |
|---|---|---|---|
| Superadmin | `http://localhost:5173/login` | `superadmin@ppbi.local` | `superadmin123` |
| Admin | `http://localhost:5173/login` | `admin@ppbi.local` | `admin12345` |
| Juri | `http://localhost:5173/login` | `juri@ppbi.local` | `juri12345` |
| Publik | `http://localhost:5173` | — | — |

> MinIO Console: `http://localhost:9001` (user: `minioadmin` / pass: `minioadmin`)

---

## Urutan Simulasi

```
[1] Superadmin setup
    └─ Buat event
    └─ Buat akun juri tambahan (opsional)
    └─ Assign juri ke event

[2] Publik mendaftar
    └─ Buka halaman event
    └─ Isi form registrasi
    └─ Simpan nomor registrasi

[3] Admin check-in
    └─ Verifikasi data bonsai peserta
    └─ Confirm judging number
    └─ Peserta masuk queue

[4] Admin kelola queue
    └─ Reorder antrian
    └─ Mark current entry

[5] Juri menilai
    └─ Login sebagai juri
    └─ Buka entry current
    └─ Input skor per kriteria
    └─ Submit / Save & Next

[6] Publik cek hasil
    └─ Buka portal peserta
    └─ Lookup dengan nomor HP / registrasi
    └─ Lihat skor dan peringkat

[7] Live Arena
    └─ Buka halaman Live dari browser terpisah
    └─ Pantau real-time ranking
```

---

## Bagian 1 — Superadmin / Admin

### 1.1 Login

1. Buka `http://localhost:5173/login`
2. Masukkan email dan password superadmin
3. Sistem redirect ke `/admin/dashboard`

---

### 1.2 Buat Event

1. Buka **Admin → Events** (`/admin/events`)
2. Klik **New Event**
3. Isi form:
   | Field | Contoh |
   |---|---|
   | Nama Event | Depok Bonsai Festival 2026 |
   | Lokasi | Balai Kota Depok |
   | Deskripsi | Event tahunan bonsai kota Depok |
   | Publish At | hari ini (atau kemarin) |
   | Registration Open At | hari ini |
   | Registration Close At | besok |
   | Start Date | lusa |
   | End Date | 2 hari setelah start |
4. Klik **Create Event**
5. Event muncul di daftar dengan status `registration_open`

> **Tip:** Agar form registrasi publik aktif, `registration_open_at` harus ≤ sekarang dan `registration_close_at` harus > sekarang.

---

### 1.3 Buat Akun Juri (opsional jika belum ada)

1. Buka **Admin → Users** (`/admin/users`) — hanya tampil untuk superadmin
2. Klik **New User**
3. Isi:
   - Name: `Budi Santoso`
   - Email: `budi@ppbi.local`
   - Password: `juri12345`
   - Role: `juri`
   - Status: Active
4. Klik **Create User**

---

### 1.4 Assign Juri ke Event

1. Masih di halaman **Users**
2. Scroll ke bagian **Assign Judge To Event**
3. Pilih juri dari dropdown
4. Pilih event yang baru dibuat
5. Session Label (opsional): `Sesi Pagi`
6. Klik **Create Assignment**
7. Assignment muncul di tabel **Active Judge Assignments**

---

### 1.5 Register Peserta (via Admin — opsional)

> Peserta juga bisa mendaftar mandiri via halaman publik (lihat Bagian 2).

1. Buka **Admin → Participants** (`/admin/participants`)
2. Klik **Register Participant**
3. Isi nama, nomor HP, dan kota
4. Klik **Register** — sistem otomatis buat `registration_number` dan `judging_number` (status: reserved)

---

### 1.6 Check-in Peserta

1. Di halaman **Participants**, cari peserta (gunakan filter event atau search)
2. Klik ikon **⋮** → **Verify & Check-in**
3. Verifikasi dan lengkapi:
   - Tree Name: nama bonsai
   - Species: spesies latin
   - Size Category: Mame / Small / Medium / Large / XL
   - Photo URL: URL foto (upload dulu via MinIO atau gunakan URL eksternal)
4. Klik **Confirm Check-in**
5. Status peserta berubah → `checked_in`
6. `judging_number` otomatis dikonfirmasi → `confirmed`
7. Peserta masuk antrian queue dengan status `waiting`

---

### 1.7 Upload Foto Bonsai (via API / MinIO)

Gunakan endpoint upload sebelum check-in untuk mendapatkan URL foto:

```bash
curl -X POST http://localhost:3000/api/upload?bucket=bonsai-photos \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@/path/to/foto-bonsai.jpg"
```

Response:
```json
{
  "url": "http://localhost:9000/bonsai-photos/uuid.jpg",
  "fileName": "uuid.jpg",
  "bucket": "bonsai-photos"
}
```

Gunakan `url` tersebut sebagai **Photo URL** saat check-in.

---

### 1.8 Kelola Queue Penjurian

1. Buka **Admin → Judging** (`/admin/judging`)
2. Panel kiri menampilkan daftar antrian
3. **Reorder**: drag & drop item untuk ubah urutan (hanya item `waiting`)
4. Klik item untuk melihat detail di panel kanan
5. Klik **Score Selected Entry** untuk membuka form penilaian

---

### 1.9 Override Judging Number (Superadmin)

Jika ada kesalahan nomor penjurian:

1. Di halaman **Participants**, klik **⋮** → **Override Judging Number**
2. Masukkan nomor baru dan pilih status (`confirmed` / `reserved`)
3. Klik **Override** — aksi tercatat di audit log

---

### 1.10 Lock/Unlock Event (Superadmin)

1. Di halaman **Events**, setiap event punya tombol **Lock** (hanya tampil untuk superadmin)
2. Klik **Lock** → event dikunci (badge merah "Locked" muncul)
3. Klik **Unlock** untuk membuka kembali

---

## Bagian 2 — Peserta Publik

### 2.1 Melihat Event

1. Buka `http://localhost:5173`
2. Klik **Events** di navbar atau tombol **Daftar Kompetisi**
3. Halaman menampilkan semua event dengan status dan periode registrasi
4. Klik **Lihat Detail Event** untuk melihat deskripsi lengkap

---

### 2.2 Mendaftar ke Event

1. Dari halaman event, klik **Daftar Sekarang**
   > Tombol hanya aktif jika status `registration_open`
2. Isi form registrasi:
   | Field | Keterangan |
   |---|---|
   | Nama Lengkap | Nama pemilik bonsai |
   | No. WhatsApp | Digunakan untuk lookup status |
   | Kota | Asal kota |
   | Nama Bonsai | Nama/sebutan bonsai |
   | Spesies | Nama latin (contoh: Ficus microcarpa) |
   | Kategori Ukuran | Mame / Small / Medium / Large / XL |
   | Foto Bonsai | URL foto (opsional) |
3. Klik **Submit Pendaftaran**
4. Halaman sukses menampilkan:
   - **Nomor Registrasi** (simpan ini!)
   - **Nomor Penjurian** (status: reserved — akan dikonfirmasi saat check-in)

---

### 2.3 Cek Status di Portal Peserta

1. Buka `http://localhost:5173/peserta`
2. Pilih metode pencarian:
   - **No. HP** — nomor WhatsApp yang didaftarkan
   - **No. Registrasi** — contoh: `REG-2026-0001`
   - **No. Penjurian** — contoh: `J-001` (hanya tampil setelah confirmed)
3. Masukkan nomor, klik **Cari**
4. Dashboard menampilkan:
   - Data identitas dan event
   - Nomor registrasi dan penjurian
   - Status entry (`registered` → `checked_in` → `waiting` → `judging` → `judged`)
   - Skor dan peringkat (setelah penilaian selesai)
   - Data bonsai yang didaftarkan

---

### 2.4 Verifikasi Sertifikat

1. Buka `http://localhost:5173/verify-certificate`
2. Masukkan kode sertifikat (contoh: `CERT-DPK-2026-001`)
3. Klik **Verifikasi**
4. Sistem menampilkan: status valid, pemilik, spesies, peringkat, dan event

---

### 2.5 Live Arena

1. Buka `http://localhost:5173/live`
2. Halaman menampilkan entry yang sedang dinilai secara real-time
3. Ranking leaderboard update otomatis setiap ada skor baru

---

## Bagian 3 — Juri

### 3.1 Login sebagai Juri

1. Buka `http://localhost:5173/login`
2. Masukkan email dan password juri
3. Sistem redirect ke `/judge` (bukan `/admin`)

---

### 3.2 Dashboard Juri

Halaman `/judge` menampilkan:
- Event dan queue yang di-assign ke juri ini
- Daftar entry dengan status (waiting / current / done)

---

### 3.3 Menilai Entry

1. Klik entry dari daftar antrian (panel kiri)
2. Detail entry muncul di panel kanan — **identitas peserta disembunyikan** (hanya nomor penjurian dan data bonsai yang tampil)
3. Klik **Score Selected Entry**
4. Form penilaian terbuka dengan 5 kriteria (masing-masing 0–20):

   | Kriteria | Deskripsi |
   |---|---|
   | Nebari | Kualitas akar permukaan |
   | Trunk | Taper, tekstur kulit, dan gerakan batang |
   | Branch | Penempatan dan ramifikasi cabang |
   | Composition | Keseimbangan visual dan eksekusi gaya |
   | Pot | Harmoni antara pohon dan pot |

5. Geser slider untuk setiap kriteria
6. Total skor muncul otomatis di bawah
7. Pilih aksi:
   - **Submit Final Score** — simpan dan tutup form
   - **Save & Next** — simpan dan langsung buka entry berikutnya

---

### 3.4 Setelah Submit

- Entry berubah status → `done` (queue) dan `judged` (peserta)
- Ranking leaderboard ter-update otomatis
- Live Arena menampilkan skor baru secara real-time
- Form tidak bisa diubah lagi (read-only setelah `done`)

---

### 3.5 Multi-Juri

Jika lebih dari satu juri di-assign ke event:

- Setiap juri submit skor secara independen
- Entry baru dianggap `judged` setelah **semua** juri yang di-assign submit
- Skor final adalah **rata-rata** dari semua juri
- Ranking dihitung dari skor rata-rata tersebut

---

## Referensi Cepat — Status Lifecycle

### Status Peserta

```
registered → checked_in → waiting → judging → judged
```

| Status | Artinya |
|---|---|
| `registered` | Mendaftar, belum check-in |
| `checked_in` | Data bonsai diverifikasi |
| `waiting` | Dalam antrian penjurian |
| `judging` | Sedang dinilai |
| `judged` | Penilaian selesai |

### Status Queue

```
waiting → current → done
```

### Status Nomor Penjurian

| Status | Artinya |
|---|---|
| `reserved` | Dibuat saat registrasi, belum dikonfirmasi |
| `confirmed` | Dikonfirmasi saat check-in, aktif untuk penilaian |

---

## Checklist Pre-Simulasi

- [ ] Docker stack berjalan: `docker compose -f infrastructure/docker-compose.yml up -d`
- [ ] Backend reachable: `curl http://localhost:3000/api/auth/me`
- [ ] Frontend berjalan: `http://localhost:5173`
- [ ] MinIO Console aktif: `http://localhost:9001`
- [ ] 4 bucket sudah ada: `bonsai-photos`, `event-assets`, `certificates`, `documents`
- [ ] Default users sudah seed (superadmin, admin, juri)
- [ ] Minimal 1 event dengan status `registration_open` sudah dibuat
- [ ] Juri sudah di-assign ke event

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Form registrasi tidak muncul tombol Daftar | Cek `registration_open_at` ≤ sekarang di admin |
| Upload foto gagal | Pastikan bucket `bonsai-photos` ada di MinIO, token valid |
| Skor tidak update real-time | Refresh halaman Live Arena; pastikan WebSocket tidak diblokir |
| Juri tidak bisa lihat queue | Pastikan juri sudah di-assign ke event di halaman Users |
| Login gagal | Jalankan migrate ulang untuk seed user default |
| Override judging number gagal 409 | Nomor yang dimasukkan sudah dipakai peserta lain |

---

*Dokumen ini dibuat untuk keperluan simulasi E2E internal PPBI Ranting Depok.*
*Platform: PPBI Depok Bonsai Registry & Competition Platform*
