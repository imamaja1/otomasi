# WhatsApp Gateway — Setup & Penggunaan

> **Server:** `https://otomasi.punyaku.online`

---

## Prasyarat

1. Aplikasi sudah terdaftar (lihat [api-reference.md](./api-reference.md))
2. API Key dengan permission `whatsapp`
3. Chromium terinstall di server (`/usr/bin/chromium`)

---

## 1. Cek Status

```bash
curl -H "x-api-key: KEY" https://otomasi.punyaku.online/api/v1/whatsapp/status
```

**Response:**

| state | Artinya |
|---|---|
| `ready` | WhatsApp siap kirim pesan |
| `awaiting_scan` | QR code tersedia, perlu scan |
| `error` | Ada masalah (cek `lastError`) |
| `idle` | Belum di-inisialisasi |
| `disconnected` | Terputus, akan reconnect |

---

## 2. Kirim Pesan

```bash
curl -X POST https://otomasi.punyaku.online/api/v1/whatsapp/send \
  -H "x-api-key: KEY" \
  -H "Content-Type: application/json" \
  -d '{"to":"6281234567890","message":"Halo!"}'
```

**Response:**
```json
{"id": 1, "status": "sent"}
```

### Format nomor
Gunakan kode negara Indonesia: **62** (bukan 0 atau +62).

| Input | Dikirim ke |
|---|---|
| `6281234567890` | `6281234567890@c.us` |

---

## 3. Kirim via Notification Engine

```bash
curl -X POST https://otomasi.punyaku.online/api/v1/notification/send \
  -H "x-api-key: KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp",
    "recipient": "6281234567890",
    "title": "Booking Dikonfirmasi",
    "body": "Halo, booking anda sudah dikonfirmasi!"
  }'
```

---

## 4. Scan QR (via API — tanpa SSH)

### Cara 1: Lihat QR sebagai gambar (Postman/Browser)

```
GET https://otomasi.punyaku.online/api/v1/whatsapp/qr-image
Header: x-api-key: KEY
```

QR code langsung tampil sebagai gambar PNG. Scan dengan WhatsApp HP.

### Cara 2: Ambil string QR

```
GET https://otomasi.punyaku.online/api/v1/whatsapp/qr
Header: x-api-key: KEY
```

Copy nilai `"qr"` → buka https://goqr.me → paste → generate gambar → scan.

### Cara 3: Via SSH (jika diperlukan)

```bash
rm -rf sessions
pm2 restart otomasi   # atau restart dari aaPanel
# QR muncul di log
```

---

## 5. Integrasi Laravel

```php
// .env
AUTOMATION_KEY=ak_xxx
AUTOMATION_URL=https://otomasi.punyaku.online

// Kirim WhatsApp
Http::withHeaders(['x-api-key' => env('AUTOMATION_KEY')])
    ->post(env('AUTOMATION_URL') . '/api/v1/whatsapp/send', [
        'to' => $user->phone,
        'message' => "✅ Booking #{$booking->id} dikonfirmasi!\nPaket: {$booking->package}",
    ]);
```

---

## 6. Troubleshooting

| Masalah | Solusi |
|---|---|
| `state: idle` | Restart server (WhatsApp belum di-init) |
| `state: error` | Cek `lastError` — biasanya Chromium tidak ditemukan |
| `lastError: Could not find Chrome` | `apt install -y chromium` lalu restart |
| `isReady: true` tapi pesan tidak terkirim | Cek nomor tujuan (format 62xxx) |
| QR kadaluarsa | Restart server — QR baru akan generate |

---

## 7. Endpoint WhatsApp

| Endpoint | Method | Auth |
|---|---|---|
| `/api/v1/whatsapp/qr` | GET | x-api-key |
| `/api/v1/whatsapp/qr-image` | GET | x-api-key |
| `/api/v1/whatsapp/status` | GET | x-api-key |
| `/api/v1/whatsapp/send` | POST | x-api-key |
| `/api/v1/whatsapp/session/logout` | POST | x-api-key |
