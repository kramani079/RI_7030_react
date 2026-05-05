# MERN Directory Structures – Complete Practical Guide (MVC, MVVM, Layered, Feature-First, Hybrid)

## Overview

This guide is focused only on **MERN** (MongoDB, Express.js, React, Node.js) and explains:

- Common directory structures used in MERN projects
- How to apply **MVC** and **MVVM-style** patterns in MERN
- When to use each structure in real projects and hackathons
- Advantages and disadvantages of each approach
- Ready-to-use folder templates

The goal is to help you choose one architecture quickly and avoid confusion during implementation.

---

## Table of Contents

1. [Learning Objectives](#learning-objectives)
2. [MERN Architecture Basics](#mern-architecture-basics)
3. [Monorepo vs Split Repo](#monorepo-vs-split-repo)
4. [Core Patterns in MERN](#core-patterns-in-mern)
5. [Pattern 1: Layered Structure](#pattern-1-layered-structure)
6. [Pattern 2: MVC Structure](#pattern-2-mvc-structure)
7. [Pattern 3: MVVM-Style in MERN](#pattern-3-mvvm-style-in-mern)
8. [Pattern 4: Feature-First (Vertical Slices)](#pattern-4-feature-first-vertical-slices)
9. [Pattern 5: Hybrid Structure](#pattern-5-hybrid-structure)
10. [Pattern 6: Clean Architecture (Advanced)](#pattern-6-clean-architecture-advanced)
11. [Ready Folder Templates](#ready-folder-templates)
12. [Recommended Standards for Hackathon MERN Track](#recommended-standards-for-hackathon-mern-track)
13. [Which Pattern for Which Project Type](#which-pattern-for-which-project-type)
14. [Common Mistakes and How to Avoid Them](#common-mistakes-and-how-to-avoid-them)
15. [Final Recommendation](#final-recommendation)

---

## Learning Objectives

By the end of this guide, you will be able to:

- Decide the right folder structure for a MERN project
- Understand where MVC fits in MERN backend
- Apply MVVM-style thinking in React frontend
- Explain architecture choices in interviews or judging
- Set a standard structure for teams in a hackathon

---

## MERN Architecture Basics

MERN has two big parts:

- **Frontend (React):** UI, routes, forms, state, API calls
- **Backend (Node + Express):** routes, controllers, business logic, DB operations

So directory structure usually has:

- `client/` for React
- `server/` for Express + MongoDB

If one app is in one repository, this is called a **monorepo** layout (not to be confused with Nx/Turborepo setup).

---

## Monorepo vs Split Repo

### Option A: Single repository (recommended for hackathon)

```text
project/
  client/
  server/
  README.md
```

**Advantages**
- Easy setup and submission
- One README and one project zip
- Good for mentorship/judging

**Disadvantages**
- Repo can become large

### Option B: Separate repositories

- `myapp-frontend`
- `myapp-backend`

**Advantages**
- Clear separation
- Independent deployment pipelines

**Disadvantages**
- Harder for beginner teams
- More setup overhead in 24-hour events

---

## Core Patterns in MERN

In practice, MERN teams use one or a mix of:

1. **Layered**
2. **MVC**
3. **MVVM-style (mostly frontend)**
4. **Feature-first**
5. **Hybrid**
6. **Clean architecture (advanced)**

---

## Pattern 1: Layered Structure

Layered means grouping code by technical responsibility.

### Typical backend layering

```text
server/src/
  routes/
  controllers/
  services/
  repositories/   # optional
  models/
  middlewares/
  validators/
  config/
  utils/
```

### Typical frontend layering

```text
client/src/
  pages/
  components/
  services/       # API clients
  hooks/
  utils/
  styles/
```

### Advantages
- Very easy to understand
- Common in tutorials and production
- Good for beginners and judging

### Disadvantages
- For large projects, one folder can become huge (`controllers`, `services`)
- Cross-folder jumping increases

### Good project types
- CRUD apps
- Admin dashboards
- Inventory, ticketing, student apps

---

## Pattern 2: MVC Structure

MVC is very common on the **backend** of MERN.

- **Model:** Mongoose schemas/data
- **View:** In MERN, React frontend acts as the view
- **Controller:** Handles request/response

Usually business rules are kept in a **Service** layer (MVC + Service).

### Backend MVC template

```text
server/src/
  models/
  controllers/
  routes/
  services/       # optional but strongly recommended
  middlewares/
  config/
```

### Example request flow

`Route -> Validator -> Controller -> Service -> Model -> Response`

### Advantages
- Industry-familiar pattern
- Clean request handling
- Fast to implement in Express

### Disadvantages
- Risk of fat controllers if service layer is skipped
- Not ideal alone for very large multi-module systems

### Good project types
- API-first systems
- Hackathon submissions
- Projects where backend logic is moderate

---

## Pattern 3: MVVM-Style in MERN

Strict MVVM is native to platforms with binding (like WPF/Android/Flutter), but in React we can implement **MVVM-style**.

### Mapping MVVM to React

- **View:** React UI components
- **ViewModel:** Custom hooks or state containers (Redux/Zustand context logic)
- **Model:** API/domain types and backend data contracts

### MVVM-style frontend template

```text
client/src/
  features/
    tickets/
      view/               # page + presentation components
      viewmodel/          # custom hooks, state logic
      model/              # types/interfaces/mappers
      api/                # endpoint calls
```

### Advantages
- Better separation of UI and logic
- Easier testing of state logic
- Useful for complex forms and dashboards

### Disadvantages
- More boilerplate for small apps
- Team must follow naming conventions strictly

### Good project types
- Complex UI state apps
- Role-based dashboards
- Projects with many interactions per screen

---

## Pattern 4: Feature-First (Vertical Slices)

Instead of grouping by `controllers/services/models` globally, group by feature:

### Backend feature-first

```text
server/src/
  features/
    auth/
      auth.routes.js
      auth.controller.js
      auth.service.js
      auth.model.js
      auth.validator.js
    tickets/
      ticket.routes.js
      ticket.controller.js
      ticket.service.js
      ticket.model.js
      ticket.validator.js
  common/
    middlewares/
    config/
    utils/
```

### Frontend feature-first

```text
client/src/
  features/
    auth/
      components/
      pages/
      api.js
      hooks.js
    tickets/
      components/
      pages/
      api.js
      hooks.js
  shared/
    components/
    utils/
```

### Advantages
- Best for parallel teamwork
- Strong module ownership
- Scales better than pure layered

### Disadvantages
- Beginners may initially feel it is repetitive
- Requires common coding standards

### Good project types
- Multi-module products
- Teams with 4+ contributors
- Projects expected to grow after hackathon

---

## Pattern 5: Hybrid Structure

Most practical real-world option for MERN teams.

### Example hybrid approach

- **Backend:** Layered globally (`routes/controllers/services/models`)
- **Frontend:** Feature-first (`features/auth`, `features/tickets`)

```text
project/
  client/src/
    features/
    shared/
    app/
  server/src/
    routes/
    controllers/
    services/
    models/
    middlewares/
    validators/
```

### Advantages
- Fast onboarding
- Balanced scalability and clarity
- Works well in 24-hour and post-hackathon continuation

### Disadvantages
- Two styles in one codebase require documentation

### Good project types
- Almost all serious hackathon projects
- Team projects with mixed skill levels

---

## Pattern 6: Clean Architecture (Advanced)

### Structure idea

```text
server/src/
  domain/
    entities/
    repositories/
  application/
    usecases/
    dto/
  infrastructure/
    db/
    repositories/
    external/
  interfaces/
    http/
      controllers/
      routes/
      validators/
```

### Advantages
- Highly testable
- Framework-independent business core
- Great long-term maintainability

### Disadvantages
- Too much setup for beginners
- Overhead for a 24-hour event

### Good project types
- Advanced teams
- Architecture-focused demonstrations
- Long-term production codebases

---

## Ready Folder Templates

## Template A: Beginner MERN (fastest)

```text
project/
  client/
    src/
      pages/
      components/
      services/
      App.jsx
      main.jsx
  server/
    src/
      routes/
      controllers/
      models/
      app.js
      server.js
```

Use when: basic apps, very limited time.

## Template B: Hackathon Standard MERN (recommended)

```text
project/
  client/
    src/
      app/
      pages/
      components/
      features/
      services/
      hooks/
      utils/
      styles/
      main.jsx
      App.jsx
  server/
    src/
      config/
      models/
      services/
      controllers/
      routes/
      middlewares/
      validators/
      utils/
      app.js
      server.js
  .env.example
  README.md
```

Use when: you need clear structure + good judging readability.

## Template C: Scalable Feature-First MERN

```text
project/
  client/src/
    features/
      auth/
      inventory/
      tickets/
    shared/
    app/
  server/src/
    features/
      auth/
      inventory/
      tickets/
    common/
      middlewares/
      config/
      utils/
```

Use when: large module count, parallel team delivery.

---

## Recommended Standards for Hackathon MERN Track

If you are managing MERN track, enforce these minimum rules:

1. Keep `client` and `server` clearly separated.
2. Use this backend flow:
   - `route -> validator -> controller -> service -> model`
3. Do not place DB queries directly in routes.
4. Keep reusable frontend UI in `components`, screen-level files in `pages` or `features/.../pages`.
5. Add centralized error middleware on backend.
6. Commit a `README.md` with:
   - setup steps
   - env variables
   - endpoint list
   - feature list
7. Include `.env.example` (no secrets in repo).

---

## Which Pattern for Which Project Type

| Project Type | Best Pattern | Why |
|-------------|--------------|-----|
| Basic CRUD demo | Layered / MVC | Fastest setup |
| Role-based admin panel | Hybrid | Easy growth + readable |
| Multi-module platform | Feature-first | Parallel team work |
| Very complex business logic | Clean architecture | Testability and separation |
| UI-heavy with complex state | MVVM-style frontend + layered backend | Better UI logic management |

---

## Common Mistakes and How to Avoid Them

### Mistake 1: Fat controllers
- **Fix:** move business logic to `services`.

### Mistake 2: DB calls inside routes
- **Fix:** routes should only map URL to controller methods.

### Mistake 3: No validation layer
- **Fix:** validate request body/params before controller.

### Mistake 4: Frontend API calls spread everywhere
- **Fix:** centralize API logic in `services` or feature `api.js`.

### Mistake 5: Inconsistent naming
- **Fix:** enforce naming like:
  - `ticket.routes.js`
  - `ticket.controller.js`
  - `ticket.service.js`
  - `ticket.model.js`
  - `ticket.validator.js`

---

## Final Recommendation

For your MERN hackathon track, use:

- **Backend:** MVC + Service (layered)
- **Frontend:** Feature-first with shared components
- **Overall:** Hybrid structure

This gives the best balance of:

- speed in 24 hours,
- clarity for students and judges,
- and scalability after the event.

---

### Suggested Stack Baseline for Teams

**Frontend**
- React + Vite
- React Router
- Axios
- Optional: Redux Toolkit or Zustand

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcrypt
- Joi/Zod/express-validator
- dotenv, cors, helmet, morgan

---

*End of guide.*
