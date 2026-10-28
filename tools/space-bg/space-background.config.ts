import type { ParticlesProps } from "./particles"

/**
 * Base look of the space background, tuned in React Bits Background Studio ("Warp" preset).
 * Used on the pre-login screens and, with SPACE_PLATFORM_OVERRIDES, inside the platform.
 * Interaction-driven motion (warp, cruise speed) lives in warp-controller.ts.
 */
export const SPACE_PARTICLES_PRESET = {
    particleColors: ["#ffffff", "#ff0cf7", "#ff0cf7"],
    particleCount: 1600,
    particleSpread: 10,
    speed: 0.05,
    particleBaseSize: 25,
    sizeRandomness: 2,
    glow: 0.1,
    twinkle: 1,
    depthOfField: 0.8,
    drift: "forward",
    driftSpeed: 0.25,
    connections: false,
    connectionDistance: 55,
    moveParticlesOnHover: true,
    hoverEffect: "parallax",
    // Half the Studio value plus a longer lag: the field drifts after the cursor instead of snapping.
    particleHoverFactor: 1,
    parallaxLag: 0.9,
    hoverRadius: 225,
    clickBurst: false,
    alphaParticles: true,
    cameraDistance: 6,
    variation: 11,
} satisfies ParticlesProps

/**
 * Inside the platform: no cursor parallax and a capped frame rate while cruising,
 * because the glass surfaces (backdrop-filter) re-blur on every rendered frame.
 * Half the particles and a 1x canvas: cards cover most of the background, so the
 * difference is hardly visible while the GPU paints far less.
 * Colors come from the tenant branding at runtime.
 */
export const SPACE_PLATFORM_OVERRIDES = {
    moveParticlesOnHover: false,
    maxFps: 30,
    particleCount: 800,
    pixelRatio: 1,
} satisfies ParticlesProps
