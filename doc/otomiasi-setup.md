# Otomasi Setup

> **Server:** `https://otomasi.punyaku.online`
> 
> Tutorial setup dari awal sampai dapat API Key.

---

## 1. Daftar Aplikasi

**POST** `/api/v1/auth/register`

**Body:**
| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| name | string | Ya | Nama aplikasi |
| description | string | Tidak | Deskripsi opsional |

**Response 201:**
```json
{
  "id": 1,
  "name": "MyApp",
  "description": "Testing",
  "isActive": true,
  "createdAt": "2026-07-12T10:00:00.000Z",
  "updatedAt": "2026-07-12T10:00:00.000Z"
}
```

**Response 400:**
```json
{ "error": "Name is required" }
```

---

## 2. Generate API Key

**POST** `/api/v1/auth/api-key`

**Body:**
| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| applicationId | number | Ya | ID dari langkah 1 |
| name | string | Ya | Nama key |
| permissions | string[] | Tidak | Daftar izin |

**Response 201:**
```json
{
  "key": "ak_c9bd6893368b543bb5ffb4f5c3f0de401849b4f85d114d84c053da8177b5e03c",
  "apiKey": {
    "id": 1,
    "applicationId": 1,
    "key": "ak_c9bd6893368b543bb5ffb4f5c3f0de401849b4f85d114d84c053da8177b5e03c",
    "name": "production-key",
    "permissions": ["whatsapp", "email", "notification"],
    "isActive": true,
    "createdAt": "2026-07-12T10:01:00.000Z"
  }
}
```

**Response 400:**
```json
{ "error": "applicationId and name are required" }
```

---

## 3. Lihat Daftar Aplikasi

**GET** `/api/v1/auth/applications`

**Param:** —

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "MyApp",
    "description": "Testing",
    "isActive": true,
    "createdAt": "2026-07-12T10:00:00.000Z",
    "updatedAt": "2026-07-12T10:00:00.000Z"
  }
]
```

---

## 4. Logout WhatsApp

**POST** `/api/v1/whatsapp/session/logout`

**Header:**
| Key | Value |
|-----|-------|
| x-api-key | API Key kamu |

**Param:** —

**Response 200:**
```json
{ "message": "Logged out" }
```

**Response 401:**
```json
{ "error": "API Key is required" }
```
```json
{ "error": "Invalid API Key" }
```
