"use client"

/**
 * Cinematic "warp" for the space background (pre-login screens and platform).
 *
 * The particle loop samples `driftScale()` every frame, so a warp never triggers a
 * React render. Only coarse UI state (card leaving, warp running, which surface is
 * showing the background) goes through useSyncExternalStore.
 */

type Ease = (t: number) => number
type Key = { at: number; value: number; ease: Ease }

const easeIn: Ease = (t) => t * t * t
const easeOut: Ease = (t) => 1 - Math.pow(1 - t, 3)
const easeInOut: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * Warp profiles as driftSpeed multipliers over time (ms). The last key has no value:
 * every warp settles at the current cruise level.
 */
const PROFILES = {
    // Login succeeded: full throttle, then brake while the tenant loader takes over.
    departure: [
        { at: 900, value: 36, ease: easeIn },
        { at: 1150, value: 36, ease: easeInOut },
        { at: 2700, ease: easeOut },
    ],
    // Moving between auth screens, or signing out.
    hop: [
        { at: 450, value: 14, ease: easeIn },
        { at: 1350, ease: easeOut },
    ],
    // Moving between pages inside the platform: a gentle push.
    nudge: [
        { at: 350, value: 6, ease: easeInOut },
        { at: 1100, ease: easeOut },
    ],
} satisfies Record<string, Array<{ at: number; value?: number; ease: Ease }>>

export type WarpProfile = keyof typeof PROFILES

/** When the UI should navigate, relative to the start of the warp. */
export const WARP_NAVIGATE_AT: Record<WarpProfile, number> = { departure: 950, hop: 420, nudge: 0 }

/** Resting multiplier: 1 on the pre-login screens, slower inside the platform. */
export const CRUISE = { auth: 1, platform: 0.3 } as const
const CRUISE_TWEEN_MS = 2500

let cruise = { from: CRUISE.auth as number, to: CRUISE.auth as number, start: 0 }
let track: { start: number; keys: Key[] } | null = null
let warpTimer: number | undefined

const cruiseAt = (now: number) => {
    const t = Math.min(1, (now - cruise.start) / CRUISE_TWEEN_MS)
    return cruise.from + (cruise.to - cruise.from) * easeInOut(t)
}

export function driftScale(): number {
    const now = performance.now()
    if (!track) return cruiseAt(now)
    const t = now - track.start
    const keys = track.keys
    const last = keys[keys.length - 1]
    if (t >= last.at) {
        track = null
        return cruiseAt(now)
    }
    for (let i = 1; i < keys.length; i++) {
        const a = keys[i - 1]
        const b = keys[i]
        if (t < b.at) return a.value + (b.value - a.value) * b.ease((t - a.at) / (b.at - a.at))
    }
    return last.value
}

/** Starts a warp from the current speed, so overlapping warps never jump. */
export function playWarp(profile: WarpProfile) {
    if (prefersReducedMotion()) return
    const from = driftScale()
    const keys: Key[] = PROFILES[profile].map((key) => ({ ...key, value: ("value" in key ? key.value : undefined) ?? cruise.to }))
    track = { start: performance.now(), keys: [{ at: 0, value: from, ease: easeIn }, ...keys] }
    window.clearTimeout(warpTimer)
    setWarpUi({ warping: true })
    warpTimer = window.setTimeout(() => setWarpUi({ warping: false }), warpDuration(profile))
}

/** Eases the resting speed towards a new cruise level (e.g. when the platform takes over). */
export function setCruise(value: number) {
    const now = performance.now()
    if (value === cruise.to) return
    cruise = { from: cruiseAt(now), to: value, start: now }
    // A running warp settles at the new level too.
    if (track) track.keys[track.keys.length - 1].value = value
}

export function warpDuration(profile: WarpProfile) {
    const keys = PROFILES[profile]
    return keys[keys.length - 1].at
}

// --- Coarse UI state -------------------------------------------------------

export type WarpUiState = {
    /** The pre-login card is receding before a navigation. */
    leaving: boolean
    /** Login succeeded; keep the background alive until the platform mounts. */
    departing: boolean
    /** A warp is running (render at full frame rate). */
    warping: boolean
    /** The platform shell is mounted and wants the background. */
    platform: boolean
}

let ui: WarpUiState = { leaving: false, departing: false, warping: false, platform: false }
const listeners = new Set<() => void>()

export function getWarpUi() {
    return ui
}

const SERVER_UI: WarpUiState = { leaving: false, departing: false, warping: false, platform: false }
export function getServerWarpUi() {
    return SERVER_UI
}

export function subscribeWarpUi(listener: () => void) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export function setWarpUi(patch: Partial<WarpUiState>) {
    const next = { ...ui, ...patch }
    if ((Object.keys(next) as Array<keyof WarpUiState>).every((key) => next[key] === ui[key])) return
    ui = next
    listeners.forEach((listener) => listener())
}

export function prefersReducedMotion() {
    return typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false)
}
