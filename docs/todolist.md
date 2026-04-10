# PPBI Bonsai Platform Roadmap

## Objective

```text
Membangun sistem lomba bonsai digital end-to-end:
- Event tampil publik sebelum hari H
- Registrasi peserta dibuka otomatis H-7
- Form registrasi peserta terhubung ke event aktif
- Nomor registrasi dan nomor penjurian saling terhubung
- Check-in bonsai masuk queue judging
- Scoring, ranking, live arena, dan dashboard peserta berjalan real-time
```

## Core Rule

```text
1 peserta = 1 nomor registrasi
1 peserta = 1 nomor penjurian
1 peserta bisa mendaftarkan 1 bonsai lomba pada entry ini

Nomor registrasi = identitas privat peserta
Nomor penjurian = identitas publik untuk lomba

Nomor registrasi HARUS selalu terhubung ke nomor penjurian
meskipun nomor penjurian belum diumumkan ke publik.
```

## Saran Alur Yang Lebih Baik

```text
1. Admin membuat event lebih awal
2. Event sudah tampil di website publik
3. Sebelum H-7:
   - halaman event bisa dilihat
   - tombol daftar tampil nonaktif
   - ada countdown "registrasi dibuka dalam X hari"
4. Mulai H-7:
   - link/form pendaftaran aktif otomatis
   - peserta memilih event lalu daftar
5. Saat submit registrasi:
   - sistem membuat registration_number
   - sistem juga membuat relasi ke judging_number
   - judging_number boleh berstatus reserved/hidden terlebih dahulu
6. Saat check-in/admin verifikasi:
   - data bonsai dikonfirmasi
   - judging_number menjadi confirmed/active
   - peserta masuk queue
7. Saat event dimulai:
   - nomor dikunci
   - tidak boleh ubah urutan dan identitas tanpa otorisasi admin
```

## Keputusan Domain Yang Direkomendasikan

```text
Nomor penjurian sebaiknya sudah dibuat saat registrasi, bukan saat scoring.

Alasan:
- relasi register -> judging_number sudah ada dari awal
- dashboard peserta bisa menunjukkan "nomor penjurian Anda sedang diproses / sudah ditetapkan"
- admin tidak perlu membuat nomor manual satu per satu mendekati hari H
- audit trail lebih jelas

Tetapi:
- status visibilitas nomor penjurian bisa dibedakan:
  reserved = sudah dibuat internal, belum ditampilkan ke publik
  confirmed = sudah final dan boleh dipakai untuk check-in/judging
```

## Event Lifecycle Publik

### Status Event

```text
draft
published
registration_open
registration_closed
ongoing
finished
```

### Rule Waktu Event

```text
publish_at = kapan event mulai tampil di website
registration_open_at = default H-7 dari tanggal event
registration_close_at = default H-1 atau sesuai aturan panitia

Rule:
- event boleh terlihat publik sejak publish_at
- tombol daftar hanya aktif saat sekarang >= registration_open_at
- tombol daftar nonaktif saat sekarang > registration_close_at
```

## Flow Utama Sistem

```text
Admin buat event
-> set publish_at
-> set registration_open_at
-> event tampil di website

Peserta buka halaman event
-> lihat status event
-> jika belum H-7, tombol daftar nonaktif
-> jika H-7 s.d. penutupan, form aktif

Peserta submit registrasi
-> pilih event
-> isi biodata peserta
-> isi data bonsai
-> generate registration_number
-> generate judging_number (reserved)
-> status = registered

Admin verifikasi / peserta check-in
-> konfirmasi data bonsai
-> judging_number confirmed
-> status = checked_in / waiting
-> masuk queue

Judging
-> scoring
-> ranking
-> publish live
```

## Phase 1 - Public Registration

### Public Event Listing

- [x] Halaman event publik ambil data dari backend, bukan mock data
- [x] Event card menampilkan:
  - nama event
  - lokasi
  - tanggal
  - status event
  - countdown pembukaan registrasi
  - tombol `Daftar Sekarang` / `Segera Dibuka`
- [x] Badge status:
  - `Coming Soon`
  - `Registration Open`
  - `Registration Closed`
  - `Ongoing`
  - `Finished`

### Public Event Detail

- [x] Tambah halaman detail event publik
- [x] Tampilkan:
  - deskripsi event
  - syarat lomba
  - periode registrasi
  - kuota peserta
  - status tombol daftar
- [x] Jika belum H-7:
  - tombol daftar disabled
  - tampil alasan dan countdown

### Public Registration Form

- [x] Buat form pendaftaran peserta publik
- [x] Field minimal:
  - full_name
  - phone
  - city
  - bonsai_name
  - species
  - size_category
  - photo
- [x] Form wajib terhubung ke `event_id`
- [x] Submit form menghasilkan:
  - `registration_number`
  - relasi ke `judging_number`
  - status awal `registered`
- [x] Setelah submit:
  - tampil halaman sukses
  - tampil nomor registrasi
  - tampil status nomor penjurian: `reserved` atau `confirmed`

## Phase 2 - Admin Participant Management

### Participant Management

- [x] Tampilkan kolom:
  - registration_number
  - judging_number
  - judging_number_status
  - event
  - participant status
- [x] Gunakan badge status asli:
  - registered
  - checked_in
  - waiting
  - judging
  - judged
- [ ] Tambahkan filter:
  - per event
  - per status
  - nomor registrasi
  - nomor penjurian

### Check-in Flow

- [x] Check-in tidak membuat peserta baru
- [x] Check-in hanya mengonfirmasi entry yang sudah terdaftar
- [x] Saat check-in:
  - verifikasi biodata
  - verifikasi bonsai
  - update foto bonsai bila perlu
  - confirm judging_number
  - ubah status ke `checked_in`
- [x] Setelah check-in:
  - entry masuk queue `waiting`

## Phase 3 - Judging Queue

- [x] Gunakan tabel `judging_queue` sebagai sumber kebenaran queue
- [x] Status queue:
  - waiting
  - current
  - done
- [x] Queue hanya berisi peserta yang:
  - registration valid
  - check-in selesai
  - judging_number confirmed
- [x] Admin bisa:
  - reorder queue
  - remove dari queue
  - mark current
  - mark done

## Phase 4 - Scoring and Ranking

- [x] Perhitungan total score otomatis di backend
- [x] Ranking auto update
- [x] Tie handling dasar
- [x] Save and Next di halaman judging
- [x] Lock input setelah final submit
- [x] Prevent double scoring
- [x] Multi-juri aggregation

## Phase 5 - Dashboard Peserta

- [x] Peserta lookup dengan:
  - phone
  - registration_number
  - judging_number
- [x] Dashboard peserta tampilkan:
  - event
  - registration_number
  - judging_number
  - bonsai yang didaftarkan
  - status entry
  - score
  - ranking

## Backend Schema Final

### Table: events

```sql
id
name
location
description
date_start
date_end
publish_at
registration_open_at
registration_close_at
status
```

### Table: participants

```sql
id
event_id
name
phone
city
registration_number unique
judging_number unique
judging_number_status (reserved/confirmed)
status
created_at
updated_at
```

### Table: bonsai

```sql
id
owner_id
name
species
size_category
photo_url
created_at
updated_at
```

### Table: judging_queue

```sql
id
event_id
participant_id
judging_number
queue_order
status (waiting/current/done)
created_at
updated_at
```

### Table: scoring

```sql
id
participant_id
judging_number
nebari_score
trunk_score
branch_score
composition_score
pot_score
total_score
created_at
updated_at
```

## API Flow

### Public Events

```http
GET /api/events/public
GET /api/events/public/:id
```

### Public Registration

```http
POST /api/public/register
GET /api/public/register/status/:registrationNumber
```

### Admin Participants

```http
GET /api/participants
POST /api/participants
POST /api/participants/check-in
PUT /api/participants/:id/confirm-judging-number
```

### Queue

```http
GET /api/queue
POST /api/queue/reorder
POST /api/queue/enqueue
POST /api/queue/next
```

## Domain Rule

### Registrasi

```text
Peserta mendaftar ke event tertentu
-> sistem membuat registration_number
-> sistem membuat judging_number reserved
-> keduanya saling terhubung di database
```

### Lock Rule

```text
Saat event sudah ongoing:
- tidak boleh registrasi baru
- tidak boleh ubah registration_number
- tidak boleh ubah judging_number tanpa superadmin
```

### Judging Rule

```text
Juri hanya melihat judging_number
Juri tidak melihat identitas peserta
```

## Immediate Next Tasks

- [x] Ubah halaman event publik dari mock data ke API backend
- [x] Tambah `publish_at`, `registration_open_at`, `registration_close_at` di model event
- [x] Buat endpoint `GET /api/events/public`
- [x] Buat form registrasi publik terhubung ke event
- [x] Pastikan `POST register` langsung membuat `registration_number` + `judging_number`
- [x] Tampilkan `registrationNumber` dan `judgingNumber` di admin participants page
- [x] Tambahkan `judging_number_status` agar nomor penjurian bisa reserved dulu lalu confirmed saat check-in
- [x] Ubah flow check-in menjadi verifikasi entry, bukan entry creation

## Next Phase - Authentication And Access Control

### RBAC

- [x] Tambah sistem RBAC aplikasi
- [x] Role minimum:
  - `superadmin`
  - `admin`
  - `juri`
- [x] Definisikan permission per role

### Superadmin

- [x] Buat role `superadmin`
- [ ] `superadmin` bisa:
  - create user
  - assign role
  - manage event
  - lock/unlock event
  - override judging number bila diperlukan
  - lihat audit log
- [x] Tambahkan halaman manajemen user untuk `superadmin`
- [x] CRUD user superadmin yang benar-benar fungsional

### Role Juri

- [x] Buat role `juri`
- [x] `juri` hanya bisa:
  - login
  - melihat queue/jadwal penilaian yang diberikan
  - membuka halaman penilaian
  - mengisi score
  - submit score
- [x] `juri` tidak boleh:
  - melihat identitas privat peserta
  - mengubah event
  - mengubah queue global
  - mengakses halaman admin lain

### Login End-to-End

- [x] Buat halaman login frontend terhubung ke backend
- [x] Backend auth minimal:
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- [x] Pakai JWT atau session token
- [x] Frontend simpan token dengan aman
- [x] Tambahkan route protection berbasis role
- [x] Redirect user sesuai role setelah login

### Backend Auth And User Schema

- [x] Tambah table `users`

```sql
id
name
email
password_hash
role
status
created_at
updated_at
```

- [x] Tambah middleware:
  - authenticate
  - authorizeRole
- [x] Semua route admin/juri wajib protected
- [ ] Tambahkan audit log login dan aktivitas penting
- [x] Tambahkan audit log login dan aktivitas penting

### Juri Scoring Page

- [x] Buat halaman khusus `juri`
- [x] Halaman juri menampilkan:
  - entry yang sedang dinilai
  - nomor penjurian
  - data bonsai yang boleh dilihat juri
  - form score per kriteria
  - tombol submit
- [x] Halaman juri tidak menampilkan:
  - nama peserta
  - kontak peserta
  - identitas privat lain
- [x] Setelah submit:
  - score tersimpan ke backend
  - ranking ter-update
  - jika perlu, lanjut ke entry berikutnya

### Judge Assignment

- [x] Tambah konsep assignment juri ke event / sesi
- [ ] `superadmin` atau `admin` bisa assign juri ke event
- [x] Juri hanya melihat event dan queue yang di-assign ke dirinya

### Protected Frontend Routes

- [x] Tambahkan halaman:
  - `/login`
  - `/admin/users`
  - `/judge`
- [x] Pisahkan layout:
  - public layout
  - admin layout
  - judge layout
- [x] Jika token invalid atau expired:
  - logout otomatis
  - redirect ke login

## Final Target

```text
Peserta PPBI bisa melihat event lebih awal
Registrasi hanya aktif pada jendela waktu yang ditentukan
Setiap pendaftaran langsung punya nomor register dan relasi ke nomor penjurian
Admin bisa memverifikasi dan mengaktifkan entry tanpa input ulang
Judging berjalan rapi, anonim, dan bisa diaudit
```
