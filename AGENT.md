# Mental Juornal — Agent Context (Cursor)

## 1. Project Overview

This is a privacy-first anonymous social platform focused on emotional support and shared human experiences.

Users can:

* publish anonymous posts about difficult life situations
* read other users’ posts to feel less alone
* optionally allow or disable comments
* chat privately if both sides agree
* use emotional tags instead of clinical labels

The goal is NOT engagement optimization, but emotional safety, empathy and support.

---

## 2. Core Principles (VERY IMPORTANT)

* Full anonymity (no real names, no public identity)
* No likes, no popularity system, no rankings
* No algorithmic addiction loops
* Safety-first communication
* AI moderation for all user-generated content
* User consent for interaction (comments & chat)

---

## 3. Tech Stack

### Frontend

* Next.js
* AI-assisted development (Cursor generates most UI)
* TailwindCSS (simple styling)

### Backend (manual development — learning focus)

* NestJS
* REST API for core logic
* WebSocket module for chat
* PostgreSQL as primary database
* Redis for realtime/chat scaling (optional MVP stage)

### AI Layer

* Moderation service for:

  * posts
  * comments
  * chat messages
* Output: allow / block / review
* Must prioritize safety over permissiveness

---

## 4. Core Modules

### 4.1 Posts

* Anonymous user posts
* Optional comments enabled per post
* Emotional tags attached to posts
* No engagement metrics (no likes/views counters)

### 4.2 Comments

* AI-moderated before publishing
* Must be empathetic or neutral
* Toxic / harmful content is blocked

### 4.3 Chat

* Private conversations only if both users agree
* WebSocket-based
* No read receipts
* No online status tracking
* No typing indicators (optional to add later, but discouraged for MVP)

### 4.4 Tags System

Emotional, non-medical tags like:

* "Jest mi ciężko"
* "Samotność"
* "Relacje"
* "Zmiana"
* "Strata"
* "Praca"
* "Potrzebuję wsparcia"

Tags must NOT be diagnostic or medical labels.

---

## 5. AI Moderation Rules

AI must evaluate:

* toxicity
* harassment
* manipulation
* self-harm encouragement
* hate speech

Output format:

```json
{
  "allow": true,
  "reason": "optional explanation",
  "severity": "low | medium | high"
}
```

Hard rule:

* If uncertain → reject or flag for review

Safety > freedom of expression.

---

## 6. Database Concept (PostgreSQL)

Core entities:

* users (anonymous identities)
* posts
* comments
* conversations
* messages
* tags

No personal data (email optional only for recovery, not visible anywhere).

---

## 7. Architecture Rules

* API is the single source of truth
* Frontend must never contain business logic
* WebSocket layer only handles realtime messaging
* AI moderation sits between input → DB

Flow:
User Input → API → AI Moderation → Database → Frontend/WS

---

## 8. Non-Goals (IMPORTANT)

Do NOT build:

* social ranking systems
* recommendation algorithms based on engagement
* follower systems
* influencer mechanics
* gamification (streaks, points, badges)

---

## 9. Development Philosophy

* Backend is written manually (learning goal)
* Frontend can be AI-assisted (Cursor)
* Keep architecture simple over scalable
* Optimize for clarity, not overengineering

---

## 10. MVP Scope

Start with:

* create post
* list posts
* comments (with toggle)
* basic AI moderation
* simple chat (optional second phase)

Do NOT start with:

* CMS
* microservices
* complex event systems
* advanced caching layers

---
