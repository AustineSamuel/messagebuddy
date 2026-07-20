"use client";

import { useEffect, useRef, useState } from "react";
import HeroPhoneBack from "./HeroPhoneBack";
import HeroPhoneScreen from "./HeroPhoneScreen";
import { usePhoneStylesReady } from "./usePhoneStylesReady";
import "./hero-phone-3d.css";

type Props = {
  className?: string;
};

type Transform = {
  rotateX: number;
  rotateY: number;
  translateX: number;
  translateY: number;
  scale: number;
};

/** Different continuous paths — one is picked each time the phone enters view */
const ANIMATION_PATHS: Transform[][] = [
  [
    { rotateX: 6, rotateY: -10, translateX: 0, translateY: 0, scale: 1 },
    { rotateX: 2, rotateY: 55, translateX: 8, translateY: 6, scale: 0.98 },
    { rotateX: 4, rotateY: 175, translateX: 0, translateY: 2, scale: 0.96 },
  ],
  [
    { rotateX: 8, rotateY: 12, translateX: 0, translateY: 0, scale: 1 },
    { rotateX: -2, rotateY: -48, translateX: -10, translateY: 4, scale: 0.98 },
    { rotateX: 3, rotateY: -170, translateX: 0, translateY: 2, scale: 0.96 },
  ],
  [
    { rotateX: 4, rotateY: -8, translateX: 0, translateY: 0, scale: 1 },
    { rotateX: 12, rotateY: 28, translateX: 6, translateY: -4, scale: 0.99 },
    { rotateX: 0, rotateY: 95, translateX: 14, translateY: 8, scale: 0.97 },
  ],
  [
    { rotateX: 5, rotateY: 0, translateX: 0, translateY: 0, scale: 1 },
    { rotateX: -6, rotateY: 70, translateX: 10, translateY: 10, scale: 0.98 },
    { rotateX: 6, rotateY: 160, translateX: 4, translateY: 0, scale: 0.95 },
  ],
];

const INTRO_MS = 1400;
const INTRO_FROM_Y = 180;
const INTRO_DELAY_MS = 100;
const DEFAULT_REST = ANIMATION_PATHS[0]![0]!;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mix(from: Transform, to: Transform, t: number): Transform {
  return {
    rotateX: lerp(from.rotateX, to.rotateX, t),
    rotateY: lerp(from.rotateY, to.rotateY, t),
    translateX: lerp(from.translateX, to.translateX, t),
    translateY: lerp(from.translateY, to.translateY, t),
    scale: lerp(from.scale, to.scale, t),
  };
}

function samplePath(path: Transform[], progress: number): Transform {
  const t = easeInOutCubic(clamp(progress, 0, 1));
  const segments = path.length - 1;
  const scaled = t * segments;
  const index = Math.min(segments - 1, Math.floor(scaled));
  const local = scaled - index;
  return mix(path[index]!, path[index + 1]!, local);
}

function pickPath(exclude?: Transform[]): Transform[] {
  if (ANIMATION_PATHS.length === 1) return ANIMATION_PATHS[0]!;
  let next = ANIMATION_PATHS[Math.floor(Math.random() * ANIMATION_PATHS.length)]!;
  let guard = 0;
  while (next === exclude && guard < 6) {
    next = ANIMATION_PATHS[Math.floor(Math.random() * ANIMATION_PATHS.length)]!;
    guard += 1;
  }
  return next;
}

export default function HeroPhone3D({ className = "" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const introStart = useRef<number | null>(null);
  const pathRef = useRef<Transform[]>(ANIMATION_PATHS[0]!);
  const heldRef = useRef<Transform | null>(null);
  const draggingRef = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  const wasInView = useRef(false);

  const stylesReady = usePhoneStylesReady(true);
  const [introStarted, setIntroStarted] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [transform, setTransform] = useState<Transform>({
    rotateX: 4,
    rotateY: INTRO_FROM_Y,
    translateX: 0,
    translateY: 8,
    scale: 0.96,
  });

  useEffect(() => {
    if (!stylesReady) return;
    const timer = window.setTimeout(() => setIntroStarted(true), INTRO_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [stylesReady]);

  useEffect(() => {
    if (!introStarted) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rest = pathRef.current[0] ?? DEFAULT_REST;

    if (prefersReduced) {
      setTransform(rest);
      setIntroDone(true);
      return;
    }

    let frame = 0;
    let cancelled = false;

    function tick(now: number) {
      if (cancelled) return;

      if (introStart.current === null) {
        introStart.current = now;
      }

      const introT = Math.min(1, (now - introStart.current) / INTRO_MS);
      const eased = easeOutCubic(introT);

      if (introT < 1) {
        setTransform({
          rotateX: lerp(4, rest.rotateX, eased),
          rotateY: lerp(INTRO_FROM_Y, rest.rotateY, eased),
          translateX: 0,
          translateY: lerp(8, rest.translateY, eased),
          scale: lerp(0.96, rest.scale, eased),
        });
        frame = requestAnimationFrame(tick);
        return;
      }

      setTransform(rest);
      setIntroDone(true);
    }

    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [introStarted]);

  useEffect(() => {
    if (!introDone) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let frame = 0;

    function updateScroll() {
      if (draggingRef.current || heldRef.current) return;

      const root = rootRef.current;
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const inView = rect.bottom > 0 && rect.top < vh;

      if (inView && !wasInView.current) {
        pathRef.current = pickPath(pathRef.current);
      }
      wasInView.current = inView;

      if (!inView) return;

      const start = vh * 0.4;
      const end = vh * -0.2;
      const progress = clamp((start - rect.top) / (start - end), 0, 1);
      setTransform(samplePath(pathRef.current, progress));
    }

    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateScroll);
    }

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [introDone]);

  useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      if (!draggingRef.current) return;

      const dx = event.clientX - dragOrigin.current.x;
      const dy = event.clientY - dragOrigin.current.y;

      const next: Transform = {
        rotateX: clamp(dragOrigin.current.rotateX - dy * 0.28, -28, 28),
        rotateY: dragOrigin.current.rotateY + dx * 0.42,
        translateX: 0,
        translateY: 0,
        scale: 1,
      };

      heldRef.current = next;
      setTransform(next);
    }

    function onPointerUp() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDragging(false);
      // Keep heldRef so the pose stays until they leave and re-enter the hero
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  // When leaving the hero far enough, clear held drag so next visit gets a fresh path
  useEffect(() => {
    if (!introDone) return;

    function onScrollClear() {
      const root = rootRef.current;
      if (!root || draggingRef.current) return;

      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const farAway = rect.bottom < -vh * 0.35 || rect.top > vh * 1.15;

      if (farAway && heldRef.current) {
        heldRef.current = null;
        wasInView.current = false;
      }
    }

    window.addEventListener("scroll", onScrollClear, { passive: true });
    return () => window.removeEventListener("scroll", onScrollClear);
  }, [introDone]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!introDone || !stylesReady) return;
    if (event.button !== 0) return;

    event.preventDefault();
    draggingRef.current = true;
    setDragging(true);

    dragOrigin.current = {
      x: event.clientX,
      y: event.clientY,
      rotateX: transform.rotateX,
      rotateY: transform.rotateY,
    };

    heldRef.current = transform;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  const stateClass = !stylesReady
    ? "hero-phone-3d--pending"
    : !introStarted
      ? "hero-phone-3d--armed"
      : introDone
        ? "hero-phone-3d--ready"
        : "hero-phone-3d--intro";

  return (
    <div
      ref={rootRef}
      className={`hero-phone-3d ${stateClass}${dragging ? " hero-phone-3d--dragging" : ""} ${className}`.trim()}
      onPointerDown={onPointerDown}
      role="presentation"
    >
      {!stylesReady ? (
        <div className="hero-phone-3d__placeholder" aria-hidden>
          <div className="hero-phone-3d__placeholder-silhouette" />
        </div>
      ) : null}

      <div className="hero-phone-3d__glow" aria-hidden />
      <div className="hero-phone-3d__shadow" aria-hidden />

      <div
        className="hero-phone-3d__stage"
        style={
          stylesReady
            ? {
                transform: `perspective(1400px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translate3d(${transform.translateX}px, ${transform.translateY}px, 0) scale(${transform.scale})`,
              }
            : undefined
        }
      >
        <div className="hero-phone-3d__phone">
          <div className="hero-phone-3d__face hero-phone-3d__face--front">
            <div className="hero-phone-3d__frame">
              <div className="hero-phone-3d__island" aria-hidden>
                <span className="hero-phone-3d__island-cam" />
              </div>
              <div className="hero-phone-3d__screen">
                <HeroPhoneScreen paused={!introDone} />
              </div>
            </div>
          </div>

          <div className="hero-phone-3d__face hero-phone-3d__face--back">
            <HeroPhoneBack />
          </div>

          <div className="hero-phone-3d__face hero-phone-3d__face--left" aria-hidden />
          <div className="hero-phone-3d__face hero-phone-3d__face--right" aria-hidden />
          <div className="hero-phone-3d__face hero-phone-3d__face--top" aria-hidden />
          <div className="hero-phone-3d__face hero-phone-3d__face--bottom" aria-hidden />

          <span className="hero-phone-3d__btn hero-phone-3d__btn--action" aria-hidden />
          <span className="hero-phone-3d__btn hero-phone-3d__btn--vol-up" aria-hidden />
          <span className="hero-phone-3d__btn hero-phone-3d__btn--vol-down" aria-hidden />
          <span className="hero-phone-3d__btn hero-phone-3d__btn--power" aria-hidden />
        </div>
      </div>

      <p className="hero-phone-3d__hint">Drag to spin · holds your angle</p>
    </div>
  );
}
