# Git Watch

> A real-time GitHub activity monitoring system that transforms webhook events into actionable engineering intelligence through AI-powered analysis.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Database Schema](#database-schema)
- [Security](#security)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Git Watch** is an event-driven backend pipeline that captures GitHub webhook events and provides intelligent insights through AI-powered analysis. It uses a persona-based routing system to audit developer workflows, generate weekly changelogs, and deliver strict architectural feedback.

### Key Capabilities
- **Real-time Event Capture**: Monitors pushes, pull requests, issues, stars, and forks
- **AI-Powered Analysis**: Dual-persona system for management and technical auditing
- **Automated Workflow Audits**: Identifies code quality issues and development patterns
- **Community Tracking**: Monitors repository engagement metrics

---

## Architecture

The system follows an event-driven architecture with clear separation of concerns:

```
┌─────────────┐
│   GitHub    │
│  Webhooks   │
└──────┬──────┘
       │
       ↓ HTTPS (ngrok tunnel)
┌──────────────────────┐
│  Ingestion Layer     │
│  • Express Server    │
│  • HMAC Verification │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  Storage Layer       │
│  • Supabase (PostgreSQL) │
│  • JSONB Payloads    │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  Intelligence Layer  │
│  • Gemini 2.0 Flash  │
│  • Persona Routing   │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  Delivery Layer      │
│  • Discord Webhooks  │
│  • Message Chunking  │
└──────────────────────┘
```

### Components

**Ingestion Layer**
- Node.js + Express server
- HMAC SHA-256 signature verification
- Ngrok tunnel for local development

**Storage Layer**
- Supabase (PostgreSQL) for persistence
- JSONB columns for flexible schema
- Indexed queries for performance

**Intelligence Layer**
- **The Manager Persona**: Focuses on features, fixes, community engagement
- **The Strict Auditor Persona**: Analyzes engineering quality, commit patterns

**Delivery Layer**
- Discord webhook integration
- Recursive message chunking (2,000 char limit)

---

## Features

### Automated Workflow Audits
- Identifies vague commit messages
- Detects coding without linked issues
- Flags architectural anti-patterns

### Persona-Based AI Analysis
- **Manager View**: Feature delivery, bug fixes, community growth
- **Auditor View**: Code quality, engineering practices, technical debt

### Real-time Event Processing
- Push events
- Pull request lifecycle
- Issue tracking
- Repository engagement (stars/watches)

### Community Insights
- Star/watch tracking
- Contributor activity
- Project growth metrics

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0.0 or higher
- **pnpm** or **npm** package manager
- **Git** for version control

You'll also need accounts for:

- [Supabase](https://supabase.com) (PostgreSQL database)
- [Google AI Studio](https://makersuite.google.com/app/apikey) (Gemini API)
- [GitHub](https://github.com) (webhook configuration)
- [Discord](https://discord.com) (optional, for notifications)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Taophycc/git-watch.git
cd git-watch
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up PostgreSQL Database

#### Option A: Using Supabase (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to **Project Settings** → **Database**
3. Copy the connection string from the **Connection string** section
4. Run the database schema (see [Database Schema](#database-schema))

#### Option B: Local PostgreSQL

```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or use your system's package manager

# Create database
createdb gitwatch
```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development
# GitHub Webhook
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key
DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

### GitHub Webhook Setup

1. Go to your GitHub repository → **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `https://your-ngrok-url.ngrok.io/webhook`
3. **Content type**: `application/json`
4. **Secret**: Use the same value as `GITHUB_WEBHOOK_SECRET` in your `.env`
5. **Events**: Select individual events:
   - Pushes
   - Pull requests
   - Issues
   - Stars
   - Forks

### Ngrok Setup (Development)

```bash
# Install ngrok
pnpm install -g ngrok

# Start tunnel (in separate terminal)
ngrok http 3000
```

---

## Usage

### Start the Development Server

```bash
pnpm run dev
```

The server will start on `http://localhost:3000`

### Verify Setup

1. **Test endpoint**: Visit `http://localhost:3000` - should return "GitWatch is running 👁️"
2. **Test database**: Check console for "✅ Connected to Supabase"
3. **Trigger webhook**: Perform an action on GitHub (e.g., push code, open issue)
4. **Check logs**: Console should show incoming webhook events

### Available Scripts

```bash
npm run dev          
npm run build
npm start
npm run type-check  
```

---

## Database Schema

Run this SQL in your Supabase SQL Editor or via `psql`:

```sql
-- Events table
CREATE TABLE github_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_delivery_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  repository_name VARCHAR(255),
  sender_name VARCHAR(255),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


### Schema Design Notes

- **`github_delivery_id`**: Unique identifier from GitHub (prevents duplicate processing)
- **`payload`**: JSONB column stores full webhook payload for flexibility
- **`event_type`**: Indexed for fast filtering (push, pull_request, issues, etc.)
- **`created_at`**: Timestamptz for accurate timezone handling

---

## Security

### HMAC Signature Verification

All incoming webhooks are verified using HMAC SHA-256 signatures to ensure authenticity:

```typescript
// Signature verification middleware
const signature = req.headers['x-hub-signature-256'];
const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
hmac.update(JSON.stringify(req.body));
const calculatedSignature = 'sha256=' + hmac.digest('hex');

// Timing-safe comparison
crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(calculatedSignature)
);
```

---

## Roadmap

### Phase 1: Core Features ✅
- [x] GitHub webhook ingestion
- [x] HMAC signature verification
- [x] PostgreSQL storage with JSONB
- [x] Basic event logging

### Phase 2: Intelligence (In Progress)
- [x] Gemini AI integration
- [x] Persona-based routing
- [ ] Weekly changelog generation
- [ ] Automated code quality reports

### Phase 3: Advanced Features
- [ ] **Smart Alerts**: Real-time AI scanning for leaked API keys
- [ ] **Multi-Repository Support**: Track multiple projects in one pipeline
- [ ] **Contributor Dashboard**: Frontend visualization of metrics
- [ ] **Slack Integration**: Alternative to Discord notifications

### Phase 4: Enterprise
- [ ] **Multi-user authentication** (GitHub OAuth)
- [ ] **Custom webhook routing** per repository
- [ ] **API for querying historical data**
- [ ] **Export to CSV/JSON**

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style (TypeScript + ES Modules)
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

---

## License

Distributed under the MIT License. See `LICENSE` file for more information.

---

## Contact

**Project Maintainer**: Your Name

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

**Project Link**: [https://github.com/yourusername/git-watch](https://github.com/yourusername/git-watch)

---

## Acknowledgments

- [GitHub Webhooks Documentation](https://docs.github.com/en/webhooks)
- [Supabase](https://supabase.com) for PostgreSQL hosting
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Express.js](https://expressjs.com) for web framework
- [ngrok](https://ngrok.com) for local webhook testing

---

<div align="center">
Made with by Taophycc ☕
</div>