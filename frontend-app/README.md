# Installation

This document provides instructions on how to set up frontend-app, the React app of the project.

## Prerequisites

- Node.js (v20.10.0 or higher)
- npm
- clone the repository

> if you haven't cloned the repository yet, follow the instructions from the main [README.md](../README.md).

## Go to 'frontend-app' directory

```bash
    cd frontend-app
```

## Install dependencies

```bash
    npm install
```

> It may take a few minutes to install all the dependencies.

## Start the development server

```bash
    npm run dev
```

This command will start the development server at [http://localhost:5173](http://localhost:5173).

> ️❗ : If you happen to change the port, please update the `origin` in the [backend/src/app/index.ts](../backend/src/app/index.ts) file. Refer to code line 21. Otherwise, you may encounter CORS issues.
