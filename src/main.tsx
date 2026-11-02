// =============================================================
//  SkillQuest — React Entry Point
//  ─────────────────────────────────────────────────────────────
//  This is the very first JavaScript file that runs in the browser.
//  It mounts the React <App /> component into the <div id="root">
//  element defined in index.html.
//
//  StrictMode is enabled in development — it intentionally renders
//  components twice to surface side-effects and deprecated patterns.
//  It has NO effect in production builds.
// =============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // Global styles (Tailwind base import)

// Mount the entire React app onto the #root DOM element
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
