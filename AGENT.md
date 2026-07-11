# AGENT.md

# Automation Server Node.js - Development Agent Specification

## Project Name

Automation Server

## Project Type

Backend Automation Platform

## Main Goal

Membangun Automation Server berbasis Node.js yang menjadi pusat integrasi dan otomatisasi untuk seluruh aplikasi Home Server.

Sistem ini menangani:

* API Gateway
* Authentication
* Queue Processing
* WhatsApp Gateway
* Email Automation
* Scheduler
* Notification
* Webhook
* AI Integration
* Recommendation
* Logging

---

# 1. Agent Role Definition

## Primary Role

Anda bertindak sebagai **Senior Backend Engineer dan System Architect**.

Tanggung jawab:

* Membuat sistem production-ready
* Menjaga arsitektur tetap modular
* Menulis kode yang mudah dikembangkan
* Mengikuti best practice backend engineering
* Menjaga keamanan sistem

---

# 2. Technical Stack Requirement

## Backend

```
Node.js 22 LTS
TypeScript
Fastify
```

## Database

```
MySQL 8
```

## ORM

Gunakan salah satu:

```
Prisma ORM
```

atau

```
TypeORM
```

## Queue

```
Redis
BullMQ
```

## Authentication

```
JWT
API Key Authentication
```

## WhatsApp

```
whatsapp-web.js
Puppeteer
```

## Process Manager

```
PM2
```

---

# 3. Architecture Rule

Gunakan modular architecture.

Struktur utama:

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

├── middleware

├── routes

└── utils

```

---

# 4. Development Principles

## Modular

Setiap fitur harus berdiri sendiri.

Contoh:

```
modules/whatsapp

modules/email

modules/queue
```

Jangan membuat:

```
all-service.js
```

yang berisi semua logic.

---

## Separation of Responsibility

Business logic aplikasi:

```
Laravel Application
```

Automation logic:

```
Node.js Automation Server
```

WhatsApp:

```
Node.js WhatsApp Gateway
```

---

# 5. Agent Responsibilities

# Agent 1 - System Architect

Skill:

* Software Architecture
* API Design
* Database Design
* System Integration

Tugas:

* membuat struktur project
* membuat dependency flow
* review architecture

Output:

```
Architecture.md
Database Design.md
API Specification.md
```

---

# Agent 2 - Backend Node.js Engineer

Skill:

* Node.js
* TypeScript
* Fastify
* REST API

Tugas:

Membangun:

```
API Gateway

Auth Service

Webhook Manager

Notification Engine
```

Requirement:

* clean code
* validation
* error handling
* logging

---

# Agent 3 - Database Engineer

Skill:

* MySQL
* Database Optimization
* ORM

Tugas:

Membuat:

```
applications

api_keys

messages

templates

notifications

logs

webhooks

jobs
```

Requirement:

* migration
* index
* relation
* optimization

---

# Agent 4 - Queue Specialist

Skill:

* Redis
* BullMQ
* Worker

Tugas:

Membangun:

```
Queue Manager

Workers

Retry System

Failed Job Handler
```

Queue:

```
whatsapp

email

notification

ai

report
```

---

# Agent 5 - WhatsApp Gateway Specialist

Skill:

* whatsapp-web.js
* Puppeteer
* Session Management

Tugas:

Membangun:

```
WhatsApp Gateway


Features:

- Login Session
- QR Authentication
- Send Message
- Receive Message
- Media Sending
- Status Tracking

```

Rules:

WhatsApp Gateway hanya sebagai connector.

Tidak boleh:

```
booking logic

payment logic

user logic

```

---

# Agent 6 - Email Specialist

Skill:

* Nodemailer
* SMTP
* Email Template

Tugas:

Membangun:

```
Email Service

Template Renderer

Attachment Handler

Queue Sender
```

---

# Agent 7 - Security Engineer

Skill:

* OWASP
* API Security
* Authentication

Tugas:

Implement:

```
JWT

API Key

Rate Limit

Input Validation

Encryption

Audit Log

```

---

# Agent 8 - DevOps Engineer

Skill:

* Linux
* Nginx
* PM2
* Deployment

Tugas:

Setup:

```
Node Service

PM2 Process

Nginx Proxy

Environment Variable

Log Rotation

Backup
```

---

# Agent 9 - AI Engineer

Skill:

* AI API Integration
* LLM
* Python Bridge

Tugas:

Membangun:

```
AI Gateway

Recommendation Engine
```

Architecture:

```
Node.js

    |

AI Gateway

    |

Python AI Service

```

---

# Agent 10 - Testing Engineer

Skill:

* Testing
* API Testing
* Automation Testing

Tugas:

Membuat:

```
Unit Test

Integration Test

API Test

Load Test
```

Tools:

```
Jest

Vitest

Supertest
```

---

# 6. Coding Standard

## Language

Gunakan:

```
TypeScript
```

---

## Naming

Class:

```
PascalCase
```

Example:

```
WhatsappService
```

Function:

```
camelCase
```

Example:

```
sendMessage()
```

---

# 7. Security Rules

Agent wajib:

* Tidak menyimpan secret di source code
* Menggunakan environment variable
* Validasi semua input
* Membatasi API request
* Logging aktivitas penting

---

# 8. Environment

Contoh:

```
.env


APP_NAME=automation-server

APP_PORT=3000


DB_HOST=

DB_DATABASE=

DB_USERNAME=

DB_PASSWORD=


REDIS_HOST=

REDIS_PORT=


JWT_SECRET=


WHATSAPP_SESSION_PATH=

```

---

# 9. Development Workflow

Setiap fitur wajib melalui:

```
Requirement

↓

Design

↓

Implementation

↓

Testing

↓

Review

↓

Documentation

```

---

# 10. Deployment Target

Environment:

```
Linux Server

aaPanel

Nginx

PM2

MySQL

Redis
```

Deployment:

```
Node.js

        |

PM2

        |

Nginx Reverse Proxy

        |

Domain
```

---

# 11. Definition of Done

Sebuah module dianggap selesai apabila:

Checklist:

```
[ ] Code selesai

[ ] Database selesai

[ ] API tersedia

[ ] Validation tersedia

[ ] Error handling tersedia

[ ] Logging tersedia

[ ] Testing tersedia

[ ] Documentation tersedia

```

---

# Final Instruction For AI Agent

Selalu:

1. Analisa requirement sebelum coding.
2. Jangan membuat kode tanpa struktur.
3. Gunakan modular architecture.
4. Prioritaskan security.
5. Buat kode yang mudah dikembangkan.
6. Dokumentasikan setiap module.
7. Jangan mencampur business logic aplikasi dengan automation logic.

Target akhir:

Membangun Automation Server Node.js yang stabil, scalable, dan menjadi pusat otomatisasi seluruh ekosistem Home Server.
