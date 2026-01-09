# Trivia Bots - System Architecture

This document provides a detailed overview of the system architecture, components, data flow, and technical design decisions.

---

## 📐 Table of Contents

- [System Overview](#system-overview)
- [Architecture Layers](#architecture-layers)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Database Schema](#database-schema)
- [API Architecture](#api-architecture)
- [Browser Automation Flow](#browser-automation-flow)
- [Scalability Design](#scalability-design)
- [Technology Stack](#technology-stack)

---

## 🏗️ System Overview

The Trivia Bots system consists of three main subsystems:

1. **Bot Automation System** - Core engine for running AI-controlled players
2. **Admin Dashboard** - Web-based management interface
3. **Data Persistence Layer** - PostgreSQL database and Excel exports

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Admin Dashboard (Next.js)                  │  │
│  │  • Players Management                                │  │
│  │  • Session Analytics                                 │  │
│  │  • GPT Analysis                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Express.js REST API                           │  │
│  │  • /api/players                                      │  │
│  │  • /api/sessions                                     │  │
│  │  • /api/leagues                                      │  │
│  │  • /api/gpt                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ Database Queries
                            │
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │   PostgreSQL DB     │  │   Excel Files               │  │
│  │  • Players          │  │  • players.xlsx (input)     │  │
│  │  • Sessions         │  │  • results.xlsx (output)    │  │
│  │  • Results          │  │                             │  │
│  │  • Leagues          │  │                             │  │
│  │  • GPT Content      │  │                             │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              BOT AUTOMATION SYSTEM                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Game Session Orchestrator                    │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │          Player Pool Manager                 │   │  │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ... ┌──────┐   │   │  │
│  │  │  │ Bot  │ │ Bot  │ │ Bot  │     │ Bot  │   │   │  │
│  │  │  │  1   │ │  2   │ │  3   │ ... │  N   │   │   │  │
│  │  │  └──┬───┘ └──┬───┘ └──┬───┘     └──┬───┘   │   │  │
│  │  │     │        │        │            │       │   │  │
│  │  │     └────────┴────────┴────────────┘       │   │  │
│  │  │            Playwright Browser Instances     │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                      │  │
│  │  • Behavior Engine                                   │  │
│  │  • Game State Manager                                │  │
│  │  • Results Writer                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Crowd.live Platform                            │
│         (External Trivia Game Website)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Architecture Layers

### Layer 1: Presentation Layer
**Admin Dashboard (Next.js Frontend)**
- **Technology**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Purpose**: User interface for managing the system
- **Components**:
  - Players page (view/edit/sync players)
  - Sessions page (view game history)
  - Leagues page (manage leagues)
  - GPT page (generate analysis)

### Layer 2: API Layer
**REST API (Express.js Backend)**
- **Technology**: Express.js 5, Node.js ES Modules
- **Purpose**: Business logic and data access
- **Endpoints**:
  - `/api/players` - Player CRUD operations
  - `/api/sessions` - Session management
  - `/api/leagues` - League management
  - `/api/gpt` - GPT-powered analysis

### Layer 3: Business Logic Layer
**Bot Automation System**
- **Technology**: Node.js, Playwright
- **Components**:
  - Game Session Manager
  - Player Pool Orchestrator
  - Behavior Engine
  - Game State Detector

### Layer 4: Data Access Layer
**Database & File System**
- **Technology**: PostgreSQL, ExcelJS (xlsx)
- **Purpose**: Persistent storage
- **Storage Types**:
  - Structured data (PostgreSQL)
  - Excel files (input/output)

### Layer 5: External Services
**Third-party Integrations**
- **Crowd.live**: Trivia game platform (web scraping)
- **OpenAI API**: GPT-4 for content generation

---

## 🧩 Core Components

### 1. Bot Automation System

#### TriviaBot (`src/crowdlive/triviaBot.js`)
**Purpose**: Individual bot instance that plays a trivia game

**Key Responsibilities**:
- Browser initialization and navigation
- Form filling (registration)
- Game state detection
- Question handling
- Answer selection (using behavior engine)
- Result tracking

**Lifecycle**:
```
Initialize → Navigate → Register → Wait for Game → 
Handle Questions → Track Results → Cleanup
```

#### PageActions (`src/crowdlive/pageActions.js`)
**Purpose**: Low-level browser interaction abstraction

**Key Functions**:
- DOM element selection and interaction
- Form field filling
- Click actions
- Question type detection
- Answer option extraction
- Drag-and-drop simulation

#### GameStateManager (`src/crowdlive/gameState.js`)
**Purpose**: Detect current game phase

**States**:
- `REGISTRATION` - Initial form
- `WAITING` - Waiting for game to start
- `QUESTION` - Question is displayed
- `RANKING` - Ranking/results shown
- `GAME_ENDED` - Game completed

### 2. Orchestration System

#### GameSession (`src/orchestrator/gameSession.js`)
**Purpose**: Manages complete game session lifecycle

**Key Responsibilities**:
- Initialize player pool
- Coordinate bot execution
- Collect and aggregate results
- Save results to database/Excel
- Handle errors and failures

**Session Flow**:
```javascript
start() → createPool() → startAllBots() → 
collectResults() → saveResults() → cleanup()
```

#### PlayerPool (`src/orchestrator/playerPool.js`)
**Purpose**: Manage multiple concurrent browser instances

**Key Features**:
- Concurrent bot execution (up to configurable limit)
- Staggered joining (realistic timing)
- Resource management (browser cleanup)
- Progress tracking

### 3. Behavior Engine

#### BehaviorEngine (`src/players/behaviorEngine.js`)
**Purpose**: Simulate human-like decision making

**Key Features**:
- Accuracy-based answer selection
- Personality-driven timing (fast, cautious, random, normal)
- Streak simulation (hot/cold streaks)
- Reaction time variation

**Decision Process**:
```
Question → Extract Options → Calculate Decision → 
Apply Accuracy → Apply Personality → Return Answer + Delay
```

### 4. Data Management

#### ExcelLoader (`src/players/excelLoader.js`)
**Purpose**: Load player profiles from Excel file

**Features**:
- Flexible column mapping
- Data validation
- Team/club grouping
- Multiple sheet support (players, games, clubs)

#### ResultsWriter (`src/players/resultsWriter.js`)
**Purpose**: Export game results to Excel

**Output Files**:
- `results.xlsx` - Detailed player results per session
- Session summaries

#### SessionService (`admin/backend/services/sessionService.js`)
**Purpose**: Database persistence for game sessions

**Functions**:
- Save session metadata
- Upsert player results
- Create/update leagues
- Handle data relationships

### 5. Admin Dashboard

#### Backend API (`admin/backend/`)
**Structure**:
```
server.js (Express app)
├── routes/
│   ├── players.js    (Player endpoints)
│   ├── sessions.js   (Session endpoints)
│   ├── leagues.js    (League endpoints)
│   └── gpt.js        (GPT endpoints)
├── services/
│   ├── sessionService.js  (Database operations)
│   └── gptService.js      (OpenAI integration)
└── db/
    ├── index.js      (Connection & initialization)
    └── schema.sql    (Database schema)
```

#### Frontend (`admin/frontend/`)
**Structure**:
```
app/
├── layout.tsx        (Root layout)
├── page.tsx          (Dashboard home)
├── players/
│   └── page.tsx      (Players management)
├── sessions/
│   └── page.tsx      (Session history)
├── leagues/
│   └── page.tsx      (League management)
└── gpt/
    └── page.tsx      (GPT analysis)
```

---

## 🔄 Data Flow

### Bot Execution Flow

```
1. User runs: npm run bots:10
   │
   ├─> runMultipleBots.js
   │   ├─> Load players from Excel (excelLoader)
   │   └─> Create GameSession
   │
   ├─> GameSession.start()
   │   ├─> Create PlayerPool
   │   ├─> Initialize bots (TriviaBot instances)
   │   ├─> Update DB: status='running'
   │   │
   │   ├─> PlayerPool.startAll()
   │   │   ├─> For each bot:
   │   │   │   ├─> TriviaBot.run()
   │   │   │   │   ├─> Navigate to game URL
   │   │   │   │   ├─> Fill registration form
   │   │   │   │   ├─> Wait for game start
   │   │   │   │   ├─> Loop: Handle questions
   │   │   │   │   │   ├─> Detect question type
   │   │   │   │   │   ├─> Get answer options
   │   │   │   │   │   ├─> BehaviorEngine.selectAnswer()
   │   │   │   │   │   ├─> Click/type answer
   │   │   │   │   │   └─> Wait for ranking
   │   │   │   │   └─> Track results
   │   │   │   └─> Return player results
   │   │   └─> Aggregate all results
   │   │
   │   ├─> Save to Excel (resultsWriter)
   │   ├─> Save to Database (sessionService)
   │   │   ├─> Upsert session
   │   │   ├─> Upsert players
   │   │   └─> Insert player_results
   │   └─> Update DB: status='completed'
   │
   └─> Display results in console
```

### Admin Dashboard Data Flow

```
User Action (Frontend)
   │
   ├─> API Call (lib/api.ts)
   │   └─> HTTP Request to Express API
   │
   ├─> Express Route Handler
   │   ├─> Validate request
   │   ├─> Call service layer
   │   └─> Return response
   │
   ├─> Service Layer
   │   ├─> Database queries (PostgreSQL)
   │   ├─> Business logic
   │   └─> Return data
   │
   └─> Frontend receives data
       └─> Update UI (React)
```

### Database Integration Flow

```
Bot Execution
   │
   ├─> Check environment variables (DB_NAME, DB_HOST)
   │   └─> If set: Enable database integration
   │
   ├─> Lazy load sessionService (only if DB configured)
   │   └─> Import from admin/backend/services/sessionService.js
   │
   ├─> On session start:
   │   └─> updateSessionStatus('running', {...})
   │       └─> INSERT/UPDATE game_sessions
   │
   └─> On session complete:
       └─> saveSessionToDatabase(sessionResults, {...})
           ├─> Upsert game_sessions (complete status)
           ├─> Upsert players (if new players)
           ├─> Create league (if new)
           └─> INSERT player_results (individual results)
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│   leagues   │
│─────────────│
│ id (PK)     │
│ name        │◄──────────┐
│ description │           │
└─────────────┘           │
                          │
┌─────────────┐           │
│   players   │           │
│─────────────│           │
│ id (PK)     │           │
│ participant_id│         │
│ nickname    │           │
│ accuracy    │           │
│ personality │           │
│ league_id (FK)──────────┤
│ team        │           │
└─────────────┘           │
                          │
┌─────────────┐           │
│game_sessions│           │
│─────────────│           │
│ id (PK)     │           │
│ session_id  │           │
│ game_url    │           │
│ league_id (FK)──────────┘
│ status      │
│ start_time  │
│ end_time    │
│ duration    │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────┐
│ player_results  │
│─────────────────│
│ id (PK)         │
│ session_id (FK) │
│ player_id (FK)  │
│ questions_answered│
│ correct_answers │
│ accuracy        │
│ final_score     │
│ final_rank      │
└─────────────────┘

┌─────────────┐
│ gpt_content │
│─────────────│
│ id (PK)     │
│ session_id (FK) │
│ content_type│
│ content     │
│ metadata    │
└─────────────┘
```

### Key Tables

1. **leagues**
   - Stores league/team information
   - One-to-many with players and sessions

2. **players**
   - Player profiles (synced from Excel)
   - Linked to leagues
   - Referenced by player_results

3. **game_sessions**
   - Complete session records
   - Linked to leagues
   - Referenced by player_results and gpt_content

4. **player_results**
   - Individual player performance per session
   - Links players to sessions
   - Stores metrics (accuracy, score, rank)

5. **gpt_content**
   - GPT-generated analysis and scripts
   - Linked to sessions
   - Stores various content types

6. **scheduled_games**
   - Game schedule configuration
   - Used by scheduler

7. **system_logs**
   - System monitoring and debugging

---

## 🌐 API Architecture

### RESTful Design

All endpoints follow REST conventions:

- `GET /api/resource` - List resources
- `GET /api/resource/:id` - Get single resource
- `POST /api/resource` - Create resource
- `PUT /api/resource/:id` - Update resource
- `DELETE /api/resource/:id` - Delete resource

### Endpoint Structure

```
/api
├── /players
│   ├── GET    /              (List players)
│   ├── GET    /:id           (Get player)
│   ├── POST   /sync          (Sync from Excel)
│   ├── PUT    /:id           (Update player)
│   ├── DELETE /:id           (Delete player)
│   └── GET    /stats/summary (Player statistics)
│
├── /sessions
│   ├── GET    /              (List sessions)
│   ├── GET    /:id           (Get session)
│   ├── POST   /              (Create session)
│   ├── PUT    /:id           (Update session)
│   └── POST   /:id/results   (Add results)
│
├── /leagues
│   ├── GET    /              (List leagues)
│   ├── GET    /:id           (Get league)
│   ├── POST   /              (Create league)
│   ├── PUT    /:id           (Update league)
│   └── DELETE /:id           (Delete league)
│
└── /gpt
    ├── POST   /analyze-game/:sessionId
    ├── POST   /analyze-weekly
    ├── POST   /sponsor-script/:sessionId
    └── GET    /content/:sessionId
```

### Error Handling

All API endpoints use consistent error responses:

```javascript
// Success
{
  "data": {...},
  "status": "success"
}

// Error
{
  "error": "Error message",
  "status": "error",
  "code": "ERROR_CODE"
}
```

---

## 🤖 Browser Automation Flow

### Single Bot Lifecycle

```
┌─────────────────────────────────────────────────┐
│ 1. INITIALIZATION                               │
│    • Create Playwright browser instance         │
│    • Create browser context                     │
│    • Create new page                            │
│    • Initialize PageActions                     │
│    • Initialize GameStateManager                │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ 2. NAVIGATION                                    │
│    • Navigate to game URL                       │
│    • Wait for page load                         │
│    • Handle returning player (if needed)        │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ 3. REGISTRATION                                  │
│    • Detect registration form                   │
│    • Fill form fields:                          │
│      - Name (from profile)                      │
│      - Email (from profile)                     │
│      - Phone (from profile)                     │
│    • Submit form                                │
│    • Verify registration success                │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ 4. WAIT FOR GAME START                          │
│    • Poll game state                            │
│    • Detect "waiting" or "question" state       │
│    • Timeout handling                           │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ 5. GAME LOOP                                    │
│    ┌─────────────────────────────────────────┐ │
│    │ 5a. Detect Question State               │ │
│    │    • Wait for question to appear        │ │
│    │    • Extract question text              │ │
│    │                                         │ │
│    │ 5b. Get Answer Options                  │ │
│    │    • Detect question type               │ │
│    │    • Extract answer choices             │ │
│    │                                         │ │
│    │ 5c. Select Answer                       │ │
│    │    • BehaviorEngine.selectAnswer()      │ │
│    │    • Apply accuracy probability         │ │
│    │    • Apply personality timing           │ │
│    │                                         │ │
│    │ 5d. Submit Answer                       │ │
│    │    • Click answer button                │ │
│    │    • Or type answer (text/number)       │ │
│    │    • Submit form                        │ │
│    │                                         │ │
│    │ 5e. Wait for Result                     │ │
│    │    • Wait for ranking screen            │ │
│    │    • Extract ranking position           │ │
│    │    • Track correct/incorrect            │ │
│    │                                         │ │
│    │ 5f. Check for Next Question             │ │
│    │    • Detect if game continues           │ │
│    │    • Or game ended                      │ │
│    └─────────────────────────────────────────┘ │
│    • Repeat until game ends                    │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ 6. RESULT COLLECTION                            │
│    • Extract final score                        │
│    • Extract final ranking                      │
│    • Calculate accuracy                         │
│    • Return game results                        │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ 7. CLEANUP                                      │
│    • Close browser page                         │
│    • Close browser context                      │
│    • Close browser instance                     │
└─────────────────────────────────────────────────┘
```

### Question Type Handling

The system supports multiple question types:

1. **Multiple Choice**
   - Detect answer buttons (A, B, C, D)
   - Click selected answer

2. **True/False**
   - Detect true/false buttons
   - Click selected option

3. **Number Input**
   - Detect number input field
   - Type random number
   - Submit

4. **Text Input**
   - Detect text input field
   - Type answer
   - Submit

5. **Drag and Drop (Reorder)**
   - Detect draggable items
   - Simulate drag-and-drop sequence
   - Submit reordered list

6. **Image Selection**
   - Detect image options
   - Click selected image

---

## 📈 Scalability Design

### Horizontal Scaling

The system is designed to scale horizontally:

```
┌─────────────────────────────────────────┐
│         Load Balancer                   │
└─────────────────────────────────────────┘
            │
    ┌───────┼───────┐
    │       │       │
┌───▼───┐ ┌─▼───┐ ┌─▼───┐
│Worker │ │Worker│ │Worker│
│Node 1 │ │Node 2│ │Node 3│
│       │ │      │ │      │
│ 100   │ │ 100  │ │ 100  │
│ bots  │ │ bots │ │ bots │
└───────┘ └──────┘ └──────┘
```

### Resource Management

**Browser Instances**:
- Each bot uses one browser context
- Contexts share browser process (memory efficient)
- Automatic cleanup on completion

**Concurrency Control**:
- Configurable max concurrent bots (`MAX_CONCURRENT_BOTS`)
- Queue system for excess bots
- Staggered joining to avoid detection

### Performance Optimization

1. **Connection Pooling**: PostgreSQL connection pool
2. **Lazy Loading**: Database integration only loads if configured
3. **Batch Operations**: Bulk insert for player results
4. **Async/Await**: Non-blocking operations throughout
5. **Resource Cleanup**: Automatic browser cleanup

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Next.js built-in

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Language**: JavaScript (ES Modules)
- **Database**: PostgreSQL 14+

### Bot System
- **Browser Automation**: Playwright 1.57+
- **Runtime**: Node.js 18+
- **Language**: JavaScript (ES Modules)

### Data Processing
- **Excel**: xlsx (ExcelJS)
- **Database**: pg (node-postgres)

### AI/ML
- **OpenAI API**: GPT-4 for content generation

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Process Management**: PM2 (recommended for scheduler)
- **Hosting**: Render.com (configured)

### Development Tools
- **Logging**: Winston
- **Environment**: dotenv
- **API Testing**: Built-in Express endpoints

---

## 🔒 Security Considerations

1. **Environment Variables**: Sensitive data stored in `.env` (not committed)
2. **Database Credentials**: Securely stored, never logged
3. **API Authentication**: Currently open (add authentication for production)
4. **CORS**: Configured for admin dashboard
5. **Input Validation**: API endpoints validate input
6. **SQL Injection**: Parameterized queries (pg library)

---

## 🚀 Deployment Architecture

### Recommended Production Setup

```
┌──────────────────────────────────────────┐
│          Render.com (Cloud)              │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Admin Frontend (Next.js)         │ │
│  │   Port: Auto-assigned              │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Admin Backend (Express)          │ │
│  │   Port: Auto-assigned              │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   PostgreSQL Database              │ │
│  │   (Managed by Render)              │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
                  │
                  │ API calls
                  ▼
┌──────────────────────────────────────────┐
│      Bot Automation Server               │
│      (Docker/VPS/Cloud Instance)         │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Game Scheduler (PM2)             │ │
│  │   • Runs continuously              │ │
│  │   • Executes scheduled games       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Bot Workers (Docker)             │ │
│  │   • Executes game sessions         │ │
│  │   • Saves results to database      │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

For implementation details, see the source code and inline documentation.

