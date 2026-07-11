# Product Requirement Document (PRD)

# Automation Server Node.js

**Version:** 1.0
**Status:** Planning
**Platform:** Home Server Infrastructure

---

# 1. Product Overview

## Product Name

Automation Server

## Description

Automation Server adalah layanan pusat otomatisasi berbasis Node.js yang berfungsi sebagai middleware antara aplikasi bisnis dengan berbagai layanan eksternal.

Sistem ini menjadi pusat pengelolaan:

* WhatsApp automation
* Email automation
* Notification
* Background processing
* Scheduler
* Webhook
* AI integration
* Recommendation system
* Logging

Automation Server tidak menangani business logic aplikasi utama.

Business logic tetap berada pada masing-masing aplikasi:

* ExploreRide
* GIS Apotek
* Wedding System
* Sistem Sekolah

---

# 2. System Architecture

```
                         Applications

        ┌────────────┬────────────┬────────────┐
        │            │            │            │
   ExploreRide   GIS Apotek   Wedding     School


                         |
                         |
                    REST API
                    Webhook


                         |
                         v


              Automation Server Node.js


        ┌───────────────────────────────────┐
        │                                   │
        │ API Gateway                       │
        │ Auth Service                      │
        │ Queue Manager                     │
        │ WhatsApp Gateway                  │
        │ Email Service                     │
        │ Scheduler                         │
        │ Notification Engine               │
        │ Webhook Manager                   │
        │ AI Gateway                        │
        │ Recommendation Engine             │
        │ Logging System                    │
        │                                   │
        └───────────────────────────────────┘


                |                 |
                |                 |
              MySQL             Redis
          Persistent Data    Queue & Cache


                |
                |
          WhatsApp Service

          whatsapp-web.js

```

---

# 3. Goals

## Primary Goals

Membangun platform automation terpusat yang:

* Mengurangi duplikasi sistem antar aplikasi
* Menyediakan API automation standar
* Mengelola komunikasi otomatis
* Menjalankan background process
* Menyediakan monitoring dan logging
* Mendukung pengembangan AI di masa depan

---

# 4. Non Goals

Automation Server tidak bertanggung jawab terhadap:

* User management aplikasi bisnis
* Transaksi bisnis
* Database utama aplikasi
* Booking logic
* Akademik logic
* GIS processing utama

---

# 5. Technology Stack

## Backend

```
Node.js
TypeScript
Fastify
```

## Database

```
MySQL 8
```

## Queue

```
Redis
BullMQ
```

## WhatsApp

```
whatsapp-web.js
```

## Authentication

```
JWT
API Key
```

---

# 6. Main Features

# 6.1 API Gateway

## Description

Gateway utama komunikasi antara aplikasi dengan Automation Server.

## Responsibilities

* menerima request
* validasi API key
* routing service
* response handling

## Endpoint

```
/api/v1/auth

/api/v1/message

/api/v1/email

/api/v1/notification

/api/v1/webhook

/api/v1/ai

/api/v1/system

```

---

# 6.2 Auth Service

## Description

Mengatur autentikasi aplikasi yang menggunakan Automation Server.

## Features

* API Key Management
* Application Registration
* Token Validation
* Permission Control

## Database

Table:

```
applications
api_keys
```

---

# 6.3 Queue Manager

## Description

Mengatur pekerjaan asynchronous.

## Technology

```
Redis
BullMQ
```

## Queue Type

```
whatsapp_queue

email_queue

notification_queue

ai_queue

report_queue

```

## Features

* retry
* failed job
* priority
* worker management

---

# 6.4 WhatsApp Gateway

## Description

Service penghubung WhatsApp menggunakan whatsapp-web.js.

## Responsibility

* login WhatsApp session
* send message
* receive message
* media handling
* status tracking

## Not Responsible

Tidak menangani:

* booking
* user
* payment
* business rules

## Endpoint

```
POST /whatsapp/send

GET /whatsapp/status

POST /whatsapp/session/logout

```

---

# 6.5 Email Service

## Description

Layanan pengiriman email.

## Features

* SMTP support
* Email template
* Attachment
* Queue sending
* Delivery logging

Provider:

```
SMTP
Brevo
SendGrid
Mailgun
```

---

# 6.6 Scheduler

## Description

Menjalankan pekerjaan otomatis berdasarkan waktu.

## Technology

```
node-cron
```

## Example

```
08:00

Check reminder

Send notification

```

Use Case:

* Wedding reminder
* Booking reminder
* School notification

---

# 6.7 Notification Engine

## Description

Sistem pusat pengiriman notifikasi.

Channel:

```
WhatsApp

Email

Telegram

Push Notification

```

Flow:

```
Event

↓

Notification Engine

↓

Channel Handler

↓

User

```

---

# 6.8 Webhook Manager

## Description

Menerima event dari aplikasi.

Example:

```
booking.created

payment.success

student.registered

```

Payload:

```json
{
 "event":"booking.created",
 "source":"exploreride",
 "data":{}
}

```

---

# 6.9 AI Gateway

## Description

Gateway komunikasi dengan AI Service.

Architecture:

```
Node.js

    |

AI Gateway

    |

Python AI Service

```

## Features

* chatbot
* text processing
* summarization
* classification

---

# 6.10 Recommendation Engine

## Description

Sistem rekomendasi.

Version 1:

Rule Based

Example:

```
User interest:

Pantai


Result:

Recommend beach packages

```

Future:

* Machine Learning
* User behavior analysis

---

# 6.11 Logging System

## Description

Mencatat semua aktivitas sistem.

Log Type:

```
API Request

WhatsApp

Email

Queue

Error

AI Request

System

```

---

# 7. Database Design

## Tables

```
applications

api_keys

users

templates

whatsapp_messages

email_messages

notifications

jobs_history

schedules

webhooks

ai_requests

recommendations

system_logs

api_logs

```

---

# 8. Security Requirement

## API Security

* API Key validation
* JWT authentication
* Rate limiting

## Data Security

* Encrypt credential
* Hide secret key
* Secure session

## Logging Security

Tidak menyimpan:

* password
* token
* credential

---

# 9. Folder Structure

```
automation-server

src

├── app.ts
├── server.ts

├── config

├── modules

│   ├── auth

│   ├── api

│   ├── whatsapp

│   ├── email

│   ├── queue

│   ├── scheduler

│   ├── notification

│   ├── webhook

│   ├── ai

│   ├── recommendation

│   └── logging


├── workers

├── database

├── routes

├── middleware

└── utils

```

---

# 10. Development Roadmap

# Phase 1 - Foundation

Target:

* Node.js setup
* TypeScript
* Fastify
* MySQL connection
* Redis connection
* API Gateway
* Auth Service

---

# Phase 2 - Communication

Target:

* WhatsApp Gateway
* Email Service
* Template Engine

---

# Phase 3 - Automation

Target:

* Queue Manager
* Worker System
* Scheduler
* Notification Engine
* Webhook

---

# Phase 4 - Intelligence

Target:

* AI Gateway
* Recommendation Engine

---

# Phase 5 - Management

Target:

* Dashboard
* Monitoring
* System Health
* Analytics

---

# 11. Success Metrics

System berhasil apabila:

* Semua aplikasi dapat menggunakan satu automation API
* WhatsApp dapat dikirim melalui gateway
* Queue berjalan stabil
* Semua aktivitas tercatat
* Service dapat ditambah tanpa mengubah aplikasi utama

---

# 12. Future Development

Future module:

* Telegram Gateway
* Discord Bot
* Voice Notification
* OCR Service
* AI Agent
* Multi WhatsApp Account
* Multi Tenant Automation

---

# Final Architecture

```
Laravel Applications

        |

        |

Automation Server Node.js

        |

 ┌───────────────┐
 │               │
Redis          MySQL
 │
Queue

        |

WhatsApp Gateway

        |

whatsapp-web.js

```

**Automation Server menjadi pusat integrasi dan otomatisasi seluruh ekosistem Home Server.**
