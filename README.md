# JunkinsX Frontend

React + Vite frontend for the JunkinsX CI/CD backend.

## Features

- User authentication (register/login)
- Pipeline dashboard and details
- Bundle, task, and secret management
- Pipeline execution and live logs via STOMP/SockJS

## Prerequisites

- Node.js 20+
- npm 10+
- JunkinsX backend running (Spring Boot)

## Setup

1. Install dependencies:

	npm install

2. Configure environment variables:

	cp .env.example .env

3. Start development server:

	npm run dev

## Environment Variables

- `VITE_API_BASE_URL`: backend base URL, for example `http://localhost:8080`

This value is used for both REST API calls and logs WebSocket/SockJS connection.

## Build

- Production build:

  npm run build

- Preview production build:

  npm run preview
