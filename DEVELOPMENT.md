# Development Guidelines - stemadeleine.fr

> **Quick reference for developers and AI assistants**

## 🚨 CRITICAL RULES

### Frontend API Calls

- **ALWAYS use `axiosClient` hook** - never use axios directly
- The hook handles authentication and headers automatically

### Icons

- **ONLY use Heroicons** (@heroicons/react)
- Import: `import { IconName } from '@heroicons/react/24/outline'`

### Language

- **All code, logs, comments in ENGLISH**
- Only user-facing strings can be French

## 🏗️ Architecture

- **Backend**: Spring Boot 3.5.4 + Java 21 + PostgreSQL
- **Frontend Public**: React 19.2.0 + TailwindCSS
- **Frontend Admin**: Next.js + TailwindCSS + Framer Motion

## 📋 Naming Conventions

### Java

- Controllers: `*Controller`
- Services: `*Service`
- Repositories: `*Repository`

### Frontend

- Components in `src/components/`
- Use functional components with hooks
- 2 spaces indentation

## 🗄️ Database Rules

- **Content versioning**: All content has `contentId` + `version`
- **Soft delete only** - never physically delete content
- Always create new versions for modifications

---

**For complete guidelines, see [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md)**
