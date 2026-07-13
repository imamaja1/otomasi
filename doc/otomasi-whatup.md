# Otomasi WhatsApp

> **Server:** `https://otomasi.punyaku.online`
>
> Cara menggunakan WhatsApp Gateway: cek status, scan QR, kirim pesan.

**Semua endpoint butuh header:**
| Key | Value |
|-----|-------|
| x-api-key | API Key kamu |

---

## 1. Cek Status WhatsApp

**GET** `/api/v1/whatsapp/status`

**Response 200:**
```json
{
  "isReady": true,
  "state": "ready",
  "lastError": null
}
```

**State yang mungkin:**
| State | Artinya |
|-------|---------|
| `idle` | Belum di-inisialisasi |
| `initializing` | Sedang mulai |
| `awaiting_scan` | QR tersedia, perlu scan |
| `ready` | Siap kirim pesan |
| `error` | Ada masalah (cek lastError) |
| `disconnected` | Terputus |
| `logged_out` | Sudah logout |

---

## 2. Ambil QR String

**GET** `/api/v1/whatsapp/qr`

**Response 200:**
```json
{
  "qr": "2@oVsQR+...",
  "isReady": false,
  "generatedAt": "2026-07-12T10:05:00.000Z",
  "state": "awaiting_scan",
  "lastError": null
}
```

> Copy nilai `qr` → buka https://goqr.me → paste → generate → scan dengan WhatsApp HP.

---

## 3. Lihat QR Gambar

**GET** `/api/v1/whatsapp/qr-image`

**Response 200:** Gambar PNG (langsung tampil di browser/Postman)

**Response 404:**
```json
{ "error": "QR not available. Restart server or wait for QR generation." }
```

> Buka URL ini di browser atau Postman. QR muncul sebagai gambar. Scan dengan WhatsApp HP.

---

## 4. Kirim Pesan WhatsApp

**POST** `/api/v1/whatsapp/send`

**Body:**
| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| to | string | Ya | Nomor tujuan (format 62xxx) |
| message | string | Ya | Isi pesan |

**Response 201:**
```json
{
  "id": 1,
  "status": "sent"
}
```

**Status yang mungkin:**
| Status | Artinya |
|--------|---------|
| `sent` | Langsung terkirim (WA ready) |
| `pending` | Masuk antrian (akan diproses worker) |
| `failed` | Gagal kirim |

**Response 400:**
```json
{ "error": "to and message are required" }
```

---

## 5. Logout WhatsApp

**POST** `/api/v1/whatsapp/session/logout`

**Response 200:**
```json
{ "message": "Logged out" }
```

> Setelah logout, restart server untuk generate QR baru dan login ulang.
