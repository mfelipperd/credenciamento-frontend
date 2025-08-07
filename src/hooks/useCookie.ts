import { useState } from "react";

export interface CookieOptions {
  days?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export const useCookie = (
  name: string,
  defaultValue: string = "",
  options: CookieOptions = {}
): [string, (value: string) => void, () => void] => {
  const [value, setValue] = useState<string>(() => {
    if (typeof document === "undefined") return defaultValue;

    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.split("=")[1]) : defaultValue;
  });

  const setCookie = (newValue: string) => {
    setValue(newValue);

    if (typeof document === "undefined") return;

    const {
      days = 30,
      path = "/",
      domain,
      secure = false,
      sameSite = "lax",
    } = options;

    let cookieString = `${name}=${encodeURIComponent(newValue)}`;

    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
    }

    cookieString += `; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (secure) {
      cookieString += "; secure";
    }

    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  };

  const deleteCookie = () => {
    setValue(defaultValue);

    if (typeof document === "undefined") return;

    const { path = "/", domain } = options;

    let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
  };

  return [value, setCookie, deleteCookie];
};
