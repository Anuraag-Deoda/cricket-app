# Cricket Companion - AI-Powered Cricket Scoring Platform

## Overview

Cricket Companion is an AI-powered cricket scoring and analytics platform designed for enthusiasts, captains, and match analysts. The application provides real-time match scoring capabilities, intelligent commentary generation in Hindi and English, and comprehensive analytics visualization. Built as a full-stack web application, it combines modern web technologies with AI-powered features to create an engaging cricket experience.

The platform supports offline-first functionality with local data persistence, making it suitable for matches in areas with limited connectivity. It features ball-by-ball scoring, automated commentary generation using Google's Gemini AI, player and team management, and detailed match analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built using React with TypeScript, leveraging Vite for development and build tooling. The UI framework is based on shadcn/ui components with Radix UI primitives, providing a consistent and accessible design system. TailwindCSS handles styling with custom cricket-themed color variables and responsive design patterns.

State management is handled through Zustand with persistence middleware for offline-first functionality. The application uses React Query for server state management and API communications. The routing is managed by Wouter for lightweight client-side navigation.

The interface is designed with mobile-first principles, featuring responsive layouts, bottom navigation for mobile devices, and desktop tabs for larger screens. Key components include live scoring interfaces, analytics dashboards, commentary feeds, and team management panels.

### Backend Architecture
The server is built on Express.js with TypeScript, following a RESTful API design. The architecture separates concerns through dedicated route handlers, storage abstractions, and service layers for external integrations.

Currently implements an in-memory storage system (MemStorage) with plans for SQLite integration through Drizzle ORM. The storage interface abstracts data operations for teams, players, matches, balls, and commentary, allowing for future database migrations without changing business logic.

The API endpoints handle CRUD operations for cricket entities including teams, players, matches, and ball-by-ball scoring data. Error handling middleware provides consistent error responses across all endpoints.

### Data Storage Solutions
The application is configured for PostgreSQL as the primary database using Drizzle ORM with the @neondatabase/serverless driver. Database schemas are defined for teams, players, matches, balls, innings, overs, partnerships, and AI commentary.

The schema design supports comprehensive cricket statistics tracking including player performance metrics, match states, and historical data. The current implementation includes an in-memory fallback for development and testing purposes.

Database migrations are managed through Drizzle Kit with configuration pointing to shared schema definitions. The setup supports both development and production database environments through environment variable configuration.

### Authentication and Authorization
The current architecture includes session management infrastructure with connect-pg-simple for PostgreSQL session storage. Authentication mechanisms are prepared but not fully implemented in the current codebase.

The frontend includes user interface elements (avatar, settings) suggesting planned user authentication features. The backend session configuration indicates support for persistent user sessions across requests.

## External Dependencies

### AI and Machine Learning Services
- **Google Gemini AI**: Primary AI service for generating cricket commentary in Hindi and English using the @google/genai package
- **GPT-4**: Secondary AI provider (referenced in commentary interface) for enhanced commentary generation
- The AI commentary system supports contextual ball-by-ball commentary with match situation awareness

### Database and Storage
- **Neon Database**: PostgreSQL-compatible serverless database platform via @neondatabase/serverless
- **Drizzle ORM**: Database ORM for schema definition, migrations, and query building
- **SQLite**: Configured as alternative database option through Drizzle's SQLite dialect

### UI and Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives for React
- **shadcn/ui**: Pre-built component library based on Radix UI with TailwindCSS styling
- **TailwindCSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

### Development and Build Tools
- **Vite**: Frontend build tool and development server with React plugin support
- **TypeScript**: Type safety across both frontend and backend codebases
- **Replit Integration**: Development environment integration with runtime error handling and cartographer plugins

### Form and Data Management
- **React Hook Form**: Form state management with @hookform/resolvers for validation
- **Zod**: Schema validation library integrated with Drizzle for type-safe data operations
- **TanStack React Query**: Server state management and API communication
- **Zustand**: Client-side state management with persistence capabilities

### Date and Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **clsx & class-variance-authority**: Conditional CSS class management
- **nanoid**: Unique ID generation for database records