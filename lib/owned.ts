"use client";

import { useSyncExternalStore } from "react";

export interface OwnedPlace {
  slug: string;
  display: string;
  label: string;
  token: string;
  created_at: string;
}

const KEY = "placepoint:owned";

export function listOwned(): OwnedPlace[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

const EVENT = "placepoint:owned-change";

function write(list: OwnedPlace[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function saveOwned(p: OwnedPlace) {
  write([p, ...listOwned().filter((x) => x.slug !== p.slug)]);
}

export function removeOwned(slug: string) {
  write(listOwned().filter((x) => x.slug !== slug));
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

let cacheRaw: string | null = null;
let cacheList: OwnedPlace[] = [];
function snapshot(): OwnedPlace[] {
  const raw = localStorage.getItem(KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheList = listOwned();
  }
  return cacheList;
}

/** Owned places on this device; null during server render. */
export function useOwned(): OwnedPlace[] | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

export function ownedToken(slug: string): string | null {
  return listOwned().find((x) => x.slug === slug)?.token ?? null;
}
