import { useEffect, useRef } from "preact/hooks";

import { playConnectionSound } from "../lib/connection-sounds";

import type { NodeConnectionState } from "@shared/schemas/node-config.schema";

function isSessionActive(state: NodeConnectionState): boolean {
  return state === "connected" || state === "connecting" || state === "awaiting_approval";
}

export function useConnectionSounds(state: NodeConnectionState): void {
  const prevStateRef = useRef<NodeConnectionState | null>(null);

  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;

    if (prev === null) return;

    if (state === "connected" && prev !== "connected") {
      void playConnectionSound("connect");
      return;
    }

    if (isSessionActive(prev) && !isSessionActive(state)) {
      void playConnectionSound("disconnect");
    }
  }, [state]);
}
