"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { DEFAULT_UF_VALUE_CLP } from "@/domain";
import type { UfIndicator } from "@/lib/uf-service";

const CLIENT_CACHE_MS = 5 * 60 * 1000;
const REFRESH_MS = 30 * 60 * 1000;

interface UfStoreState {
  ufToClp: number;
  loading: boolean;
  lastUpdated: Date | null;
  indicatorDate: string | null;
  isFallback: boolean;
}

let store: UfStoreState = {
  ufToClp: DEFAULT_UF_VALUE_CLP,
  loading: true,
  lastUpdated: null,
  indicatorDate: null,
  isFallback: false,
};

const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;
let lastFetchAt = 0;
let refreshTimer: ReturnType<typeof setInterval> | null = null;
let listenersBound = false;

function emit() {
  for (const listener of listeners) listener();
}

function setStore(patch: Partial<UfStoreState>) {
  store = { ...store, ...patch };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return store;
}

async function loadUf(force = false) {
  const now = Date.now();
  if (
    !force &&
    inflight === null &&
    lastFetchAt > 0 &&
    now - lastFetchAt < CLIENT_CACHE_MS
  ) {
    return;
  }

  if (inflight) {
    await inflight;
    return;
  }

  inflight = (async () => {
    if (!force && store.loading === false && now - lastFetchAt < CLIENT_CACHE_MS) {
      return;
    }

    setStore({ loading: store.lastUpdated === null });

    try {
      const response = await fetch("/api/uf", { cache: "no-store" });
      if (!response.ok) throw new Error("UF API error");

      const data = (await response.json()) as UfIndicator;
      lastFetchAt = Date.now();

      setStore({
        ufToClp: Math.round(data.value),
        loading: false,
        lastUpdated: new Date(data.fetchedAt),
        indicatorDate: data.date,
        isFallback: Boolean(data.fallback),
      });
    } catch {
      setStore({
        loading: false,
        isFallback: true,
        lastUpdated: store.lastUpdated ?? new Date(),
      });
    }
  })().finally(() => {
    inflight = null;
  });

  await inflight;
}

function ensureGlobalListeners() {
  if (listenersBound || typeof document === "undefined") return;
  listenersBound = true;

  refreshTimer = setInterval(() => {
    void loadUf(true);
  }, REFRESH_MS);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void loadUf(true);
    }
  });
}

export function useUfValue() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const refresh = useCallback(() => loadUf(true), []);

  useEffect(() => {
    ensureGlobalListeners();
    void loadUf();
  }, []);

  return {
    ufToClp: state.ufToClp,
    loading: state.loading,
    lastUpdated: state.lastUpdated,
    indicatorDate: state.indicatorDate,
    isFallback: state.isFallback,
    refresh,
  };
}
