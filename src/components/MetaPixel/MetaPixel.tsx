/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect } from "react";

interface MetaPixelProps {
  /** Seu ID do pixel (ex: '798068891626886') */
  pixelId: string;
  /** Nome do evento a trackear (ex: 'PageView', 'InitiateCheckout') */
  eventName?: string;
}

export function MetaPixel({ pixelId, eventName = "PageView" }: MetaPixelProps) {
  useEffect(() => {
    if ((window as any).fbq) {
      (window as any).fbq("init", pixelId);
      (window as any).fbq("track", eventName);
      return;
    }

    // Injeta o script do Meta Pixel
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );

    // Inicializa e dispara o evento
    (window as any).fbq("init", pixelId);
    (window as any).fbq("track", eventName);
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
