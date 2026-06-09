import { useEffect } from "react";

type FbqWindow = Window & {
  fbq?: ((...args: unknown[]) => void) & {
    callMethod?: (...args: unknown[]) => void;
    queue: unknown[][];
    push?: unknown;
    loaded?: boolean;
    version?: string;
  };
  _fbq?: unknown;
};

interface MetaPixelProps {
  /** Seu ID do pixel (ex: '798068891626886') */
  pixelId: string;
  /** Nome do evento a trackear (ex: 'PageView', 'InitiateCheckout') */
  eventName?: string;
}

export function MetaPixel({ pixelId, eventName = "PageView" }: MetaPixelProps) {
  useEffect(() => {
    const win = window as FbqWindow;
    if (win.fbq) {
      win.fbq("init", pixelId);
      win.fbq("track", eventName);
      return;
    }

    // Inject Meta Pixel script
    const n: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue: unknown[][];
      push?: unknown;
      loaded?: boolean;
      version?: string;
    } = (...args: unknown[]) => {
      if (n.callMethod) {
        n.callMethod(...args);
      } else {
        n.queue.push(args);
      }
    };

    win.fbq = n;
    if (!win._fbq) win._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];

    const script = document.createElement("script") as HTMLScriptElement;
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    const existing = document.getElementsByTagName("script")[0];
    existing.parentNode?.insertBefore(script, existing);

    win.fbq("init", pixelId);
    win.fbq("track", eventName);
  }, [pixelId, eventName]);

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=${eventName}&noscript=1`}
        alt="fb-pixel"
      />
    </noscript>
  );
}
