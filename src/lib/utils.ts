import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toast(msg: string) {
  const el = document.getElementById("runway-toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout((el as HTMLElement & { _t?: number })._t);
  (el as HTMLElement & { _t?: number })._t = window.setTimeout(() => el.classList.remove("show"), 2200);
}
