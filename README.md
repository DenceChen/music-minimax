# Music MiniMax

> AI-Powered Music Generation Platform - Create songs with artificial intelligence

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-green?style=flat-square&logo=playwright)](https://playwright.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

## Overview

Music MiniMax is a modern AI-powered music creation platform that enables users to generate custom songs through natural language conversations. Built with Next.js 14, the application features a sophisticated Sonic Spectrum Design System providing an immersive, visually stunning user experience.

### Key Features

- **Natural Language Interface**: Describe your song ideas in plain language
- **AI Lyrics Generation**: Automatically generate professional lyrics with AI
- **Music Synthesis**: One-click song generation using MiniMax API
- **Real-time Audio Playback**: Integrated audio player with waveform visualization
- **Multi-language Support**: Available in English, Chinese, and Japanese
- **Session Management**: Track and manage your song creation history
- **Responsive Design**: Optimized experience across desktop, tablet, and mobile devices

## Technology Stack

### Core Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React framework |
| Language | TypeScript 5 | Type-safe development |
| Styling | Tailwind CSS + CSS Variables | Utility-first + Design tokens |
| Authentication | NextAuth.js | Session-based authentication |
| Internationalization | next-intl | Multi-language support |
| Audio Visualization | wavesurfer.js | Audio waveform rendering |
| Testing | Playwright | E2E testing framework |

### Backend Services

| Service | Technology | Purpose |
|---------|------------|---------|
| Database | Prisma + SQLite | Data persistence |
| API Runtime | Next.js API Routes | Serverless API endpoints |
| AI Integration | MiniMax API | Chat, lyrics & music generation |
| Logging | Winston | Application logging |

## Design System

### Sonic Spectrum v3.0

The application implements a cohesive **Sonic Spectrum** design language with the following characteristics:

#### Color Palette

```
Primary Accent (Magenta):    #e879f9
Secondary Accent (Deep Pink): #c026d3
Tertiary Accent:              #a21caf
Cyan Highlight:               #22d3ee
Background Primary:           #09090b
Background Secondary:         #111114
Background Tertiary:          #18181c
Text Primary:                 #fafafa
Text Secondary:               #a1a1aa
Text Muted:                   #52525b
```

#### Typography

| Element | Font Family | Weight |
|---------|-------------|--------|
| Display | Space Grotesk | 600-700 |
| Body | DM Sans | 400-500 |
| Code/Mono | JetBrains Mono | 400-500 |
| Serif Accents | Playfair Display | 400-600 |

#### Motion Philosophy

- **Entrance animations**: Fade + subtle translateY (300-400ms)
- **Micro-interactions**: Quick transitions (120-200ms) for hover states
- **Loading states**: Subtle pulse animations for skeleton loaders
- **Audio feedback**: Waveform shimmer effects synced to playback state

## Project Structure

```
music-minimax/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── chat/          # Chat interface
│   │   │   ├── my-songs/      # Song library
│   │   │   └── settings/      # User settings
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── chat/          # Chat API
│   │   │   ├── lyrics/        # Lyrics generation API
│   │   │   ├── music/          # Music generation API
│   │   │   └── songs/         # Song management API
│   │   └── layout.tsx         # Root layout
│   ├── components/             # React components
│   │   ├── chat/              # Chat interface components
│   │   ├── player/            # Audio player components
│   │   ├── ui/                # Reusable UI components
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utilities and helpers
│   │   ├── api/               # API client libraries
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client
│   │   └── logger.ts          # Logging utility
│   ├── i18n/                  # Internationalization config
│   └── middleware.ts          # Next.js middleware
├── tests/                     # Playwright E2E tests
│   ├── api.spec.js           # API integration tests
│   └── comprehensive.spec.js  # Full UI test suite
└── prisma/                    # Database schema
    └── schema.prisma         # Prisma schema definition
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- SQLite (bundled with Prisma)

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
MINIMAX_API_KEY="your-minimax-api-key"
```

### Installation

```bash
# Clone the repository
git clone https://github.com/DenceChen/music-minimax.git
cd music-minimax

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### Access the Application

- **Development**: http://localhost:3000
- **Default Language**: Chinese (zh)
- **Supported Languages**: English (en), Chinese (zh), Japanese (ja)

## Testing

### Test Suite

The project includes a comprehensive Playwright test suite covering:

| Category | Tests | Coverage |
|----------|-------|----------|
| Desktop UI | 8 | Layout, navigation, components |
| Mobile UI | 6 | Responsive behavior, touch interactions |
| Tablet UI | 1 | iPad layout verification |
| Smoke Tests | 4 | Core functionality |
| E2E Flows | 2 | Authentication, user journeys |
| Monkey Tests | 4 | Random interaction stability |
| Responsive | 5 | Multiple viewport sizes |
| State Management | 2 | Session and language persistence |
| Error Handling | 2 | Invalid routes and network errors |

**Total**: 34 automated tests

### Run Tests

```bash
# Run all tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test file
npx playwright test comprehensive.spec.js

# Run with coverage report
npx playwright test --reporter=html
```

### Browser Testing Targets

| Browser | Platform | Viewport |
|---------|----------|----------|
| Chrome/Chromium | Desktop | 1280x800 |
| Chrome/Chromium | Mobile | 375x812 |
| Chrome/Chromium | Tablet | 768x1024 |
| iPhone SE | Mobile | 320x568 |
| iPad Pro | Tablet | 1024x1366 |

## API Reference

### Authentication

#### POST /api/auth/[...nextauth]
NextAuth.js authentication endpoint.

### Chat

#### POST /api/chat
Send a chat message and receive AI response.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "生成一首关于爱情的歌曲" }
  ],
  "locale": "zh"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "choices": [{
      "message": {
        "content": "好的，让我为你创作一首关于爱情的歌曲..."
      }
    }]
  }
}
```

### Lyrics Generation

#### POST /api/lyrics
Generate lyrics based on a prompt.

**Request:**
```json
{
  "prompt": "一首关于夏天的轻快歌曲",
  "locale": "zh"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "song_title": "夏日恋曲",
    "style_tags": "pop, upbeat, summer",
    "lyrics": "阳光洒落在金色沙滩..."
  }
}
```

### Music Generation

#### POST /api/music/generate
Generate a complete song from lyrics.

**Request:**
```json
{
  "prompt": "一首关于夏天的歌曲",
  "lyrics": "阳光洒落在金色沙滩...",
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "taskId": "task_abc123",
    "musicUrl": "/uploads/songs/song_abc123.mp3"
  }
}
```

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint and Prettier configurations
- Write self-documenting code with clear naming conventions

### Commit Convention

```
<type>(<scope>): <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc)
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks
```

### Branching Strategy

```
main          - Production-ready code
├── develop   - Integration branch
├── feature/* - Feature development
├── bugfix/*  - Bug fixes
└── hotfix/*  - Critical production fixes
```

## Known Issues & Bug Tracker

For detailed bug tracking and issue management, see [BUG_LOG.md](./BUG_LOG.md).

### Historical Issues

| Bug ID | Description | Status |
|--------|-------------|--------|
| #1 | WavePlayer AbortError | ✅ Fixed |
| #2 | Mobile layout overflow | ✅ Fixed |
| #5 | Language switching failure | ✅ Fixed |
| #6 | AI reply language mismatch | ✅ Fixed |
| #7 | Japanese translation missing | ✅ Fixed |
| #10 | Session not loading on switch | ✅ Fixed |

## Performance Considerations

### Optimization Strategies

1. **Bundle Size**: Dynamic imports for heavy components (wavesurfer.js)
2. **Rendering**: Server-side rendering for initial page loads
3. **Caching**: Lyrics cache with 24-hour TTL
4. **State Management**: Minimal re-renders with targeted state updates
5. **Animation**: CSS transforms for GPU-accelerated animations

### Lighthouse Scores (Target)

| Metric | Target | Current |
|--------|--------|---------|
| Performance | ≥90 | 85+ |
| Accessibility | ≥95 | 90+ |
| Best Practices | ≥95 | 95+ |
| SEO | ≥90 | 85+ |

## Security

### Implemented Security Measures

- **Authentication**: NextAuth.js with session-based auth
- **Input Validation**: Server-side validation for all API endpoints
- **Rate Limiting**: Daily song generation limits per user
- **CORS**: Configured for same-origin requests
- **Environment Variables**: Sensitive data stored in `.env`

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables (Production)

Ensure the following are set in your deployment platform:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Authentication secret |
| `NEXTAUTH_URL` | Yes | Production URL |
| `MINIMAX_API_KEY` | Yes | MiniMax API key |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **MiniMax** - AI API provider for chat, lyrics, and music generation
- **Vercel** - Hosting and infrastructure
- **Next.js Team** - Framework and tooling
- **Playwright Team** - Testing infrastructure

---

**Built with ❤️ by the Music MiniMax Team**
