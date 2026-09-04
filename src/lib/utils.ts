import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toast(msg: string) {
  let el = document.getElementById("runway-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "runway-toast";
    el.className =
      "pointer-events-none fixed bottom-5 left-1/2 z-[90] max-w-[90vw] -translate-x-1/2 translate-y-20 rounded-full bg-navy px-4 py-2.5 text-center text-[12px] font-semibold text-white opacity-0 shadow-card transition-all duration-200 sm:text-[13px] [&.show]:translate-y-0 [&.show]:opacity-100";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout((el as HTMLElement & { _t?: number })._t);
  (el as HTMLElement & { _t?: number })._t = window.setTimeout(() => el!.classList.remove("show"), 2200);
}
