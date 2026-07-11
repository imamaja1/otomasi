# Automation Server — Cara Pakai

**Server:** `https://otomasi.punyaku.online`

---

## 1. Daftar Aplikasi (sekali saja)

```bash
curl -X POST https://otomasi.punyaku.online/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"NamaApp"}'
```
→ Dapat `id` aplikasi

## 2. Dapatkan API Key

```bash
curl -X POST https://otomasi.punyaku.online/api/v1/auth/api-key \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"name":"production","permissions":["whatsapp","email","notification","webhook","ai","recommend"]}'
```
→ Simpan `key` di `.env` aplikasi kamu

## 3. Gunakan API

Semua request pakai header: `x-api-key: KEY_KAMU`

### WhatsApp
```bash
# Kirim pesan
curl -X POST https://otomasi.punyaku.online/api/v1/whatsapp/send \
  -H "x-api-key: KEY" -H "Content-Type: application/json" \
  -d '{"to":"6281234567890","message":"Halo!"}'

# Cek status
curl -H "x-api-key: KEY" https://otomasi.punyaku.online/api/v1/whatsapp/status
```

### Email
```bash
curl -X POST https://otomasi.punyaku.online/api/v1/email/send \
  -H "x-api-key: KEY" -H "Content-Type: application/json" \
  -d '{"to":"user@mail.com","subject":"Test","body":"<h1>Hello</h1>"}'
```

### Notification (multi-channel)
```bash
curl -X POST https://otomasi.punyaku.online/api/v1/notification/send \
  -H "x-api-key: KEY" -H "Content-Type: application/json" \
  -d '{"channel":"whatsapp","recipient":"628xxx","title":"Test","body":"Pesan"}'
```

### Webhook (event dari aplikasi)
```bash
curl -X POST https://otomasi.punyaku.online/api/v1/webhook/receive \
  -H "x-api-key: KEY" -H "Content-Type: application/json" \
  -d '{"event":"booking.created","source":"exploreride","data":{"bookingId":1}}'
```

### Recommendation
```bash
curl -X POST https://otomasi.punyaku.online/api/v1/recommend \
  -H "x-api-key: KEY" -H "Content-Type: application/json" \
  -d '{"interest":"saya suka pantai"}'
```

### AI
```bash
curl -X POST https://otomasi.punyaku.online/api/v1/ai/chat \
  -H "x-api-key: KEY" -H "Content-Type: application/json" \
  -d '{"message":"Halo"}'
```

### System
```bash
curl https://otomasi.punyaku.online/health
curl -H "x-api-key: KEY" https://otomasi.punyaku.online/api/v1/system/stats
```

---

## Integrasi Laravel

```php
// .env
AUTOMATION_KEY=ak_xxx
AUTOMATION_URL=https://otomasi.punyaku.online

// Controller
use Illuminate\Support\Facades\Http;

Http::withHeaders(['x-api-key' => env('AUTOMATION_KEY')])
    ->post(env('AUTOMATION_URL') . '/api/v1/whatsapp/send', [
        'to' => $user->phone,
        'message' => "Halo {$user->name}, booking dikonfirmasi!",
    ]);
```

---

## Semua Endpoint

| Method | Path | Auth |
|---|---|---|
| GET | `/ping` | - |
| GET | `/health` | - |
| POST | `/api/v1/auth/register` | - |
| POST | `/api/v1/auth/api-key` | - |
| GET | `/api/v1/whatsapp/qr` | x-api-key |
| GET | `/api/v1/whatsapp/qr-image` | x-api-key |
| GET | `/api/v1/whatsapp/status` | x-api-key |
| POST | `/api/v1/whatsapp/send` | x-api-key |
| POST | `/api/v1/email/send` | x-api-key |
| POST | `/api/v1/email/templates` | x-api-key |
| POST | `/api/v1/notification/send` | x-api-key |
| POST | `/api/v1/webhook/receive` | x-api-key |
| POST | `/api/v1/recommend` | x-api-key |
| POST | `/api/v1/ai/chat` | x-api-key |
| POST | `/api/v1/scheduler` | x-api-key |
| GET | `/api/v1/system/stats` | x-api-key |
| GET | `/api/v1/system/metrics` | - |
