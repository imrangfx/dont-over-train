"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { MessageCircle } from "lucide-react";

const STORAGE_KEY = "tawk-launcher-position";
const SIZE = 56;
const EDGE_INSET = 20;
const DRAG_THRESHOLD = 6;

type LauncherPosition = {
  readonly left: number;
  readonly top: number;
};

type TawkApi = {
  maximize?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
  }
}

function getTawk(): TawkApi | undefined {
  if (typeof window === "undefined") return undefined;
  return window.Tawk_API;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function defaultPosition(): LauncherPosition {
  if (typeof window === "undefined") {
    return { left: EDGE_INSET, top: EDGE_INSET };
  }
  return {
    left: window.innerWidth - SIZE - EDGE_INSET,
    top: window.innerHeight - SIZE - EDGE_INSET,
  };
}

function readStoredPosition(): LauncherPosition | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LauncherPosition>;
    if (
      typeof parsed.left !== "number" ||
      typeof parsed.top !== "number" ||
      !Number.isFinite(parsed.left) ||
      !Number.isFinite(parsed.top)
    ) {
      return null;
    }
    return { left: parsed.left, top: parsed.top };
  } catch {
    return null;
  }
}

function writeStoredPosition(position: LauncherPosition) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function clampToViewport(position: LauncherPosition): LauncherPosition {
  const maxLeft = Math.max(EDGE_INSET, window.innerWidth - SIZE - EDGE_INSET);
  const maxTop = Math.max(EDGE_INSET, window.innerHeight - SIZE - EDGE_INSET);
  return {
    left: clamp(position.left, EDGE_INSET, maxLeft),
    top: clamp(position.top, EDGE_INSET, maxTop),
  };
}

/** Snap horizontally to the nearer left/right edge; keep vertical clamped. */
function snapToNearestEdge(position: LauncherPosition): LauncherPosition {
  const midX = position.left + SIZE / 2;
  const snapLeft =
    midX < window.innerWidth / 2
      ? EDGE_INSET
      : window.innerWidth - SIZE - EDGE_INSET;

  return clampToViewport({ left: snapLeft, top: position.top });
}

function openTawkChat() {
  const api = getTawk();
  if (!api) return;
  api.showWidget?.();
  api.maximize?.();
}

/**
 * Branded Tawk launcher. Default Tawk bubble stays hidden via layout script;
 * this button opens chat through Tawk_API.showWidget + maximize.
 * Drag to reposition; snaps to the nearest horizontal edge and persists.
 */
export default function TawkChatLauncher() {
  const [position, setPosition] = useState<LauncherPosition>(defaultPosition);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);

  const positionRef = useRef(position);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    const stored = readStoredPosition();
    setPosition(clampToViewport(stored ?? defaultPosition()));
    setReady(true);

    // Extra hide in case the widget loaded before the layout onLoad hook.
    getTawk()?.hideWidget?.();

    const onResize = () => {
      setPosition((prev) => clampToViewport(prev));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originLeft: positionRef.current.left,
      originTop: positionRef.current.top,
      moved: false,
    };
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    drag.moved = true;
    setDragging(true);
    setPosition(
      clampToViewport({
        left: drag.originLeft + dx,
        top: drag.originTop + dy,
      }),
    );
  }, []);

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, shouldOpen: boolean) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      dragRef.current = null;
      setDragging(false);

      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Capture may already be released.
      }

      if (drag.moved) {
        const snapped = snapToNearestEdge(positionRef.current);
        setPosition(snapped);
        writeStoredPosition(snapped);
        return;
      }

      if (shouldOpen) {
        openTawkChat();
      }
    },
    [],
  );

  if (!ready) return null;

  return (
    <button
      type="button"
      aria-label="Open live chat"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => endDrag(event, true)}
      onPointerCancel={(event) => endDrag(event, false)}
      className={`btn-base fixed z-[60] flex items-center justify-center rounded-full bg-[#A3FF00] text-black shadow-[0_0_24px_rgba(163,255,0,0.45)] transition-[transform,box-shadow] duration-150 hover:scale-105 hover:shadow-[0_0_28px_rgba(163,255,0,0.55)] active:scale-95 touch-none select-none ${
        dragging ? "scale-105 cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        left: position.left,
        top: position.top,
        width: SIZE,
        height: SIZE,
      }}
    >
      <MessageCircle size={24} strokeWidth={2.25} aria-hidden="true" />
    </button>
  );
}
