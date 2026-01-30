import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-white/20 selection:bg-brand-pink/30 rounded-xl selection:text-white border border-white/10 bg-white/5 px-4 h-12 text-base text-white transition-all outline-none disabled:pointer-events-none disabled:opacity-50 md:text-sm shadow-inner",
        "focus-visible:border-brand-pink focus-visible:ring-brand-pink/20 focus-visible:ring-4",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  );
}

export { Input };
