import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const colors = [
"bg-gray-800",
"bg-red-800",
"bg-yellow-800",
"bg-green-800",
"bg-blue-800",
"bg-indigo-800",
"bg-purple-800",
"bg-pink-800",
"bg-orange-800",
"bg-teal-800"
]