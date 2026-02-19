# face-ascii-app

A real-time face tracking web app that renders your webcam feed as ASCII art. Toggle between normal camera view (with face detection bounding boxes) and an ASCII mode that converts the video stream into characters on-the-fly.

## Stack

- **React 19** — UI components
- **TypeScript** — type safety
- **Vite** (via [rolldown-vite](https://vite.dev/guide/rolldown)) — dev server & bundler
- **Tailwind CSS 4** + **daisyUI 5** — styling & UI components
- **face-api.js** — browser-based face detection (TinyFaceDetector + landmarks)
- **Bun** — package manager & runtime

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed (`curl -fsSL https://bun.sh/install | bash`)
- A browser with webcam access

### Install dependencies

```sh
bun install
```

### Run the dev server

```sh
bun run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`). Grant webcam permissions when prompted.

### Build for production

```sh
bun run build
```

The output is written to the `dist/` directory.

### Preview the production build

```sh
bun run preview
```

### Lint

```sh
bun run lint
```
