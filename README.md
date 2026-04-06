# Bonsai Connect

Platform digital untuk event bonsai PPBI yang mencakup:
- event publik dengan window registrasi
- registrasi peserta terhubung ke event
- `registration_number` dan `judging_number`
- check-in dan judging queue
- scoring, ranking, dan live arena

## Stack

- Frontend: React, TypeScript, Vite, React Query, Tailwind
- Backend: Express, Sequelize, Socket.IO
- Infra dev: Docker Compose, PostgreSQL, MinIO

## Status Saat Ini

Sudah berjalan:
- halaman event publik dari backend
- halaman detail event publik
- form registrasi publik
- generate `registration_number`
- generate `judging_number` dengan status `reserved`
- check-in admin mengubah `judging_number_status` menjadi `confirmed`
- queue judging
- scoring otomatis dan ranking realtime
- admin event management untuk:
  - `publish_at`
  - `registration_open_at`
  - `registration_close_at`
  - `status`

Belum selesai:
- RBAC `superadmin` / `admin` / `juri`
- login end-to-end
- halaman juri khusus
- `judging_queue` sebagai source of truth penuh

Roadmap detail ada di [docs/todolist.md](docs/todolist.md).

## Struktur Repo

```text
src/             frontend React
backend/         backend Express + Sequelize
infrastructure/  docker-compose untuk development
docs/            roadmap dan catatan implementasi
```

## Menjalankan Development Environment

### 1. Frontend

```bash
npm install
npm run dev
```

Frontend default berjalan di Vite dan membaca:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

### 2. Backend + Database + MinIO via Docker

```bash
docker compose -f infrastructure/docker-compose.yml up -d --build backend
```

Service dev:
- backend: `http://localhost:3000`
- postgres: `localhost:5432`
- minio api: `http://localhost:9000`
- minio console: `http://localhost:9001`

### 3. Menjalankan migrasi schema

Gunakan ini saat model backend berubah:

```bash
docker compose -f infrastructure/docker-compose.yml --profile tools run --rm backend-migrate
```

## Endpoint Penting

### Public

```http
GET /api/events/public
GET /api/events/public/:id
POST /api/public/register
```

### Admin

```http
GET /api/events
POST /api/events
PUT /api/events/:id

GET /api/participants
POST /api/participants
POST /api/participants/check-in

GET /api/queue
POST /api/scoring/submit
GET /api/ranking
GET /api/event-control/live-status
```

## Rule Domain Yang Dipakai

- 1 peserta = 1 `registration_number`
- 1 peserta = 1 `judging_number`
- registrasi publik langsung membuat nomor register dan nomor penjurian
- `judging_number_status`:
  - `reserved` saat registrasi
  - `confirmed` saat check-in
- event publik hanya membuka form daftar saat window registrasi aktif

## Catatan Development

- backend Docker dev berjalan dengan `npm run dev`
- migrasi dipisah ke service `backend-migrate`, tidak dijalankan di setiap boot
- beberapa event lama mungkin masih punya field tanggal yang belum lengkap; UI sekarang sudah diberi guard agar tidak crash

## Verifikasi Dasar

Frontend:

```bash
npm run build
```

Backend syntax check:

```bash
node --check backend/src/controllers/eventController.js
node --check backend/src/controllers/participantController.js
```

## Next Recommended Work

1. Auth backend + schema `users`
2. Halaman login end-to-end
3. RBAC `superadmin` / `admin` / `juri`
4. Halaman juri untuk scoring
5. Audit log dan assignment juri ke event
