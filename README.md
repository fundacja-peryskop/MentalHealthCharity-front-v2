# Peryskop Foundation Frontend

Peryskop Foundation Frontend is a platform designed to bridge the gap in accessibility to free psychological support. Users can submit requests to be paired with a competent volunteer via an integrated chat system. Administrators and Supervisors manage these pairings as well as overall user administration.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Roles](#user-roles)
- [Built With](#built-with)
- [Installation](#installation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

The platform addresses the shortage of free psychological help by connecting individuals in need with qualified volunteers. With a dedicated chat system, pairing functionality, specialized forms for joining the beneficiary network, a ticket system for managing reports, and a content management system for articles, the application covers a broad range of features to ensure timely and effective support.

---

## Features

- **Dedicated Chat System:** Real-time communication between users and volunteers.
- **User Pairing:** Request and pair users with appropriate volunteers.
- **Custom Join Forms:** Specialized forms for individuals wishing to become beneficiaries.
- **Ticket System:** Manage support requests and reports efficiently.
- **Content Management:** Create, manage, and edit articles to provide valuable information.

---

## User Roles

The system supports several roles, each with specific responsibilities:

- **Administrator:**
    - Manage join forms for beneficiaries.
    - Oversee chats.
    - Handle user management and ticket processing.
- **Supervisor:**
    - Manage join forms for beneficiaries.
    - Oversee chats.
    - Handle user management and ticket processing.
- **Editor:**
    - Manage and edit articles.
- **Volunteer:**
    - Create articles.
    - Provide support through the chat system to beneficiaries.

---

## Development

Requires Node 22+ (see `.nvmrc`). The design system `@fundacja-peryskop/ui` is installed from GitHub Packages, so `npm ci` needs a `GITHUB_TOKEN` environment variable holding a classic PAT with the `read:packages` scope (the committed `.npmrc` reads it).

```bash
npm ci
cp .env.example .env
npm run dev
```

| Command              | What it does                                               |
| -------------------- | ---------------------------------------------------------- |
| `npm run dev`        | Vite dev server on port 3000                               |
| `npm run build`      | Type-check (`tsc -b`) and production build into `dist/`    |
| `npm run lint`       | ESLint (includes Prettier and the Rules of Hooks)          |
| `npm run format`     | Format every file with Prettier                            |
| `npm run typecheck`  | TypeScript only, no emit                                   |
| `npm test`           | Vitest unit tests                                          |
| `npm run test:chat`  | Chat reliability tests                                     |
| `npm run i18n:check` | Translation keys, with `pl.json` as the source of truth    |
| `npm run verify`     | Everything CI checks except the build - run before pushing |

A pre-commit hook (Husky + lint-staged) formats and lints staged files.

## Continuous integration

Every pull request runs these GitHub Actions workflows:

- **CI** - lint and format, translations, tests, type-check and build, and Dependency Review (fails when a PR adds a dependency with a known high or critical vulnerability). The **CI passed** job is the single status to require in branch protection.
- **React Doctor** - React-specific checks (bugs, performance, accessibility, security). PRs fail only on error-level issues they introduce; existing findings are reported, not blocking.
- **CodeQL** - static security analysis, also weekly.

Dependabot opens grouped weekly PRs for npm packages and GitHub Actions.
