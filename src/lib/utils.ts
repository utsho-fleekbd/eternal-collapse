import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* Tailwind helper */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/*  Schwarzschild helpers  */
export const R_s = (M: number) => 2 * M; // Schwarzschild radius (G=c=1 units, scaled)
export const R_photon = (M: number) => 1.5 * R_s(M);
export const R_isco = (M: number) => 3 * R_s(M);
