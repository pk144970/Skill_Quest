// =============================================================
//  SkillQuest — Confetti Celebration Utilities
//  ─────────────────────────────────────────────────────────────
//  Wraps the `canvas-confetti` library with app-specific presets.
//
//  Usage:
//    triggerCelebration()      → small burst (e.g. XP gained, quest claimed)
//    triggerGrandCelebration() → side-cannon effect (e.g. LEVEL UP!)
// =============================================================

import confetti from 'canvas-confetti';
import { APP_CONFIG } from '../config';

// Destructure confetti settings from central config so they're easy to tune
const { colors, celebrationParticles, celebrationSpread, grandParticlesPerFrame, grandSpread, grandDurationMs } =
  APP_CONFIG.confetti;

/**
 * Triggers a small confetti burst from the center of the screen.
 * Use this for minor wins: XP gained, quest claimed, skill added, etc.
 */
export const triggerCelebration = () => {
  try {
    confetti({
      particleCount: celebrationParticles, // How many particles to fire
      spread: celebrationSpread,           // How wide they spread (degrees)
      origin: { y: 0.6 },                 // Slightly below center looks natural
      colors,
    });
  } catch {
    // Silently ignore — confetti is decorative and should never crash the app
  }
};

/**
 * Triggers a continuous left+right side cannon effect for ~1.5 seconds.
 * Use this for major wins: LEVEL UP!, first exchange completed, etc.
 */
export const triggerGrandCelebration = () => {
  try {
    const endTime = Date.now() + grandDurationMs;

    // Recursive animation loop — fires from both sides each frame
    (function fireFrame() {
      // Left cannon
      confetti({ particleCount: grandParticlesPerFrame, angle: 60, spread: grandSpread, origin: { x: 0 }, colors });
      // Right cannon
      confetti({ particleCount: grandParticlesPerFrame, angle: 120, spread: grandSpread, origin: { x: 1 }, colors });

      // Keep firing until the duration has elapsed
      if (Date.now() < endTime) {
        requestAnimationFrame(fireFrame);
      }
    })();
  } catch {
    // Silently ignore — confetti is decorative and should never crash the app
  }
};
