# Health And Fitness Tracker

A responsive Vite + React application based on the supplied reference design.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

## Features

- Add, edit and delete daily health records.
- Persists records in `localStorage` using the exact key `healthAndFitness`.
- Recent Health Statistics list (latest five records).
- Weekly Health Trends bar chart, based on the last seven calendar days.
- Overall Data pie chart, visible even when there are no records.
- Responsive layout and modal form for both add and edit.

All records are stored locally in the browser where the app is running.
