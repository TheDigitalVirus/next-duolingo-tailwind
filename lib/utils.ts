import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH || 'http://localhost:3000';
  
  // Make sure baseUrl includes the scheme (http:// or https://)
  const baseWithScheme = baseUrl.startsWith('http') 
    ? baseUrl 
    : `https://${baseUrl}`;
  
  return `${baseWithScheme}${path.startsWith('/') ? path : `/${path}`}`;
}
