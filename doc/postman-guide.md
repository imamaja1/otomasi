# Postman — Testing Automation Server

---

## Import Collection

1. Buka **Postman**
2. Klik **Import** → pilih `postman-collection.json`
3. Collection **Automation Server** muncul di sidebar

---

## Variable Collection

Klik `...` di collection → **Edit** → **Variables**:

| Variable | Value |
|---|---|
| `base_url` | `https://otomasi.punyaku.online` |

---

## Alur Testing

### 1. Register App
```
POST /api/v1/auth/register
Body: {"name":"MyApp","description":"Testing"}
```
→ `app_id` auto tersimpan

### 2. Generate API Key
```
POST /api/v1/auth/api-key
Body: {"applicationId":1,"name":"test-key","permissions":["whatsapp","email"]}
```
→ `api_key` auto tersimpan

### 3. Scan WhatsApp QR
```
GET /api/v1/whatsapp/qr-image
```
→ QR code muncul sebagai gambar → scan HP

### 4. Test semua endpoint
Semua request di folder sudah pre-filled, tinggal **Send**.

---

## Struktur Collection

```
Automation Server
├── 1. Setup
│   ├── Register Aplikasi
│   └── Generate API Key
├── 2. System
│   ├── Ping
│   ├── Health
│   ├── Metrics
│   └── Stats Dashboard
├── 3. WhatsApp
│   ├── Lihat QR Code (gambar)
│   ├── Ambil QR String
│   ├── Cek Status WA
│   └── Kirim Pesan WA
├── 4. Notification
│   ├── Kirim via WhatsApp
│   └── Kirim via Email
├── 5. Recommendation
│   ├── Travel
│   ├── Food
│   └── Education
├── 6. Webhook
│   ├── booking.created
│   ├── payment.success
│   └── student.registered
└── 7. AI
    ├── Chat
    └── Summarize
```
