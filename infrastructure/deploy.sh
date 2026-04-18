#!/bin/bash
# ============================================================
# Deploy script untuk PPBI Bonsai Connect
# Jalankan dari folder /infrastructure di server:
#   chmod +x deploy.sh && ./deploy.sh
# ============================================================

set -e  # Berhenti jika ada error

SERVER_IP="45.158.126.171"
COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env"

echo "=================================================="
echo "  PPBI Bonsai Connect — Production Deploy"
echo "  Server: http://$SERVER_IP"
echo "=================================================="
echo ""

# 1. Cek .env sudah ada
if [ ! -f ".env" ]; then
  echo "ERROR: File .env tidak ditemukan!"
  echo "Salin dari template: cp .env.example .env"
  echo "Lalu isi semua nilai yang diperlukan."
  exit 1
fi

# 2. Cek nilai default berbahaya masih ada
if grep -q "GANTI_" .env; then
  echo "ERROR: File .env masih mengandung nilai placeholder (GANTI_...)!"
  echo "Isi semua nilai sebelum deploy."
  exit 1
fi

# 3. Build frontend
echo "[1/4] Build frontend..."
cd ..
npm install --silent
VITE_API_BASE_URL="http://$SERVER_IP/api" \
VITE_WS_URL="http://$SERVER_IP" \
npm run build
cd infrastructure
echo "      Frontend built ke /dist ✓"

# 4. Build & pull images
echo "[2/4] Build Docker images..."
$COMPOSE build --no-cache backend
echo "      Images siap ✓"

# 5. Jalankan database migrate
echo "[3/4] Jalankan database migration..."
$COMPOSE run --rm backend-migrate 2>/dev/null || \
  docker compose -f docker-compose.yml --env-file .env run --rm --profile tools backend-migrate
echo "      Database schema up-to-date ✓"

# 6. Start semua services
echo "[4/4] Menjalankan semua services..."
$COMPOSE up -d
echo "      Services berjalan ✓"

echo ""
echo "=================================================="
echo "  Deploy selesai!"
echo ""
echo "  Frontend : http://$SERVER_IP"
echo "  API      : http://$SERVER_IP/api"
echo "  MinIO    : http://$SERVER_IP:9000"
echo ""
echo "  Cek status: docker compose -f docker-compose.yml -f docker-compose.prod.yml ps"
echo "  Lihat log : docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
echo "=================================================="
