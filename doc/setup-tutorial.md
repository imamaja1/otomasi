# Automation Server — Tutorial Setup Lengkap

> **Server:** `https://otomasi.punyaku.online`
> **Dibutuhkan:** cURL atau Postman

---

## Isi Tutorial

1. [Setup Awal](#1-setup-awal) — Daftar aplikasi + dapatkan API Key
2. [WhatsApp Gateway](#2-whatsapp-gateway) — Setup & kirim WhatsApp
3. [Email Service](#3-email-service) — Kirim email
4. [Webhook / Event](#4-webhook--event) — Trigger dari aplikasi
5. [Recommendation](#5-recommendation) — Rekomendasi ke user
6. [Dashboard & Monitoring](#6-dashboard--monitoring) — Cek status server

---

## 1. Setup Awal

Setiap aplikasi bisnis harus daftar dulu **sekali saja**. Hasilnya: API Key yang dipakai untuk semua request.

### Daftar Aplikasi

```bash
curl -X POST https://otomasi.punyaku.online/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "NamaAplikasiKamu",
    "description": "Deskripsi opsional"
  }'
```

**Response sukses:**
```json
{
  "id": 1,
  "name": "NamaAplikasiKamu",
  "isActive": true,
  "createdAt": "2026-07-11T14:09:33.619Z"
}
```

> Catat `id` dari response. Ini akan dipakai di langkah berikutnya.

### Generate API Key

```bash
curl -X POST https://otomasi.punyaku.online/api/v1/auth/api-key \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": 1,
    "name": "production-key",
    "permissions": ["whatsapp", "email", "notification", "webhook", "ai", "recommend"]
  }'
```

**Response sukses:**
```json
{
  "key": "ak_c9bd6893368b543bb5ffb4f5c3f0de401849b4f85d114d84c053da8177b5e03c"
}
```

> **Simpan `key` ini!** Hanya muncul sekali. Masukkan ke `.env` aplikasi kamu:
> ```
> AUTOMATION_KEY=ak_c9bd6893368b543bb5ffb4...
> ```

### Selesai!

Sekarang aplikasi kamu sudah terdaftar. Semua endpoint di bawah tinggal pakai API Key itu.

---

## 2. WhatsApp Gateway

Lihat tutorial lengkap: [doc/whatsapp.md](./whatsapp.md)

### Cek status WhatsApp
```bash
curl -H "x-api-key: API_KEY_KAMU" \
  https://otomasi.punyaku.online/api/v1/whatsapp/status
```

### Kirim pesan
```bash
curl -X POST https://otomasi.punyaku.online/api/v1/whatsapp/send \
  -H "x-api-key: API_KEY_KAMU" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "6281234567890",
    "message": "Halo, pesanan anda sudah dikonfirmasi!"
  }'
```

---

## 3. Email Service

### Kirim email langsung

```bash
curl -X POST https://otomasi.punyaku.online/api/v1/email/send \
  -H "x-api-key: API_KEY_KAMU" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@mail.com",
    "subject": "Pesanan Dikonfirmasi",
    "body": "<h1>Halo</h1><p>Pesanan #123 sudah dikonfirmasi.</p>"
  }'
```

### Kirim dengan template

```bash
# Buat template dulu
curl -X POST https://otomasi.punyaku.online/api/v1/email/templates \
  -H "x-api-key: API_KEY_KAMU" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "booking-confirm",
    "type": "email",
    "subject": "Booking {{status}}",
    "body": "<h1>Halo {{nama}}</h1><p>Booking {{status}} untuk {{paket}}.</p>"
  }'

# Kirim pakai template
curl -X POST https://otomasi.punyaku.online/api/v1/email/send \
  -H "x-api-key: API_KEY_KAMU" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "budi@mail.com",
    "template": "booking-confirm",
    "variables": {
      "nama": "Budi",
      "status": "dikonfirmasi",
      "paket": "Pantai Kuta"
    }
  }'
```

---

## 4. Webhook / Event

Kirim event dari aplikasi kamu ke Automation Server.

### booking.created (ExploreRide)

```bash
curl -X POST https://otomasi.punyaku.online/api/v1/webhook/receive \
  -H "x-api-key: API_KEY_KAMU" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "booking.created",
    "source": "exploreride",
    "data": {
      "bookingId": 101,
      "userId": 5,
      "package": "Pantai Kuta",
      "date": "2026-07-15"
    }
  }'
```

### payment.success

```bash
curl -X POST https://otomasi.punyaku.online/api/v1/webhook/receive \
  -H "x-api-key: API_KEY_KAMU" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.success",
    "source": "exploreride",
    "data": {
      "bookingId": 101,
      "amount": 500000
    }
  }'
```

### student.registered (Sekolah)

```bash
curl -X POST https://otomasi.punyaku.online/api/v1/webhook/receive \
  -H "x-api-key: API_KEY_KAMU" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "student.registered",
    "source": "school",
    "data": {
      "studentName": "Budi",
      "className": "Kelas 1A",
      "parentPhone": "6281234567890"
    }
  }'
```

### Lihat history webhook

```bash
curl -H "x-api-key: API_KEY_KAMU" \
  "https://otomasi.punyaku.online/api/v1/webhook?page=1&limit=10"
```

---

## 5. Recommendation

Minta rekomendasi berdasarkan minat user.

```bash
curl -X POST https://otomasi.punyaku.online/api/v1/recommend \
  -H "x-api-key: API_KEY_KAMU" \
  -H "Content-Type: application/json" \
  -d '{"interest": "saya suka liburan ke pantai"}'
```

**Response:**
```json
{
  "category": "travel",
  "suggestions": ["Pantai Kuta", "Gunung Bromo", "Raja Ampat Tour", "Bali Package"],
  "ruleBased": true
}
```

### Kategori yang dikenali

| Interest mengandung | Kategori | Rekomendasi |
|---|---|---|
| pantai, gunung, liburan, wisata | travel | Tour & travel packages |
| makanan, kuliner, restoran, pedas | food | Kuliner Nusantara |
| belajar, kursus, coding, bahasa | education | Kursus online |
| sehat, diet, olahraga, gym, yoga | health | Program kesehatan |

---

## 6. Dashboard & Monitoring

### Cek status server

```bash
curl https://otomasi.punyaku.online/health
```

```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "redis": "connected",
    "whatsapp": "ready"
  }
}
```

### Cek metrics

```bash
curl https://otomasi.punyaku.online/api/v1/system/metrics
```

### Stats dashboard

```bash
curl -H "x-api-key: API_KEY_KAMU" \
  https://otomasi.punyaku.online/api/v1/system/stats
```

### Logs

```bash
# System logs
curl -H "x-api-key: API_KEY_KAMU" \
  "https://otomasi.punyaku.online/api/v1/system/logs?level=error"

# API access logs
curl -H "x-api-key: API_KEY_KAMU" \
  "https://otomasi.punyaku.online/api/v1/system/api-logs"
```

---

## Kode Error

| Status | Arti | Solusi |
|---|---|---|
| 200 | OK | - |
| 201 | Created | - |
| 400 | Bad Request | Cek field yang dikirim |
| 401 | Unauthorized | API Key salah/tidak dikirim |
| 429 | Rate Limit | Terlalu banyak request (max 100/menit) |
| 500 | Server Error | Cek log atau hubungi admin |
