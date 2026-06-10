import * as React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const PageTabsList = React.forwardRef<
  React.ElementRef<typeof TabsList>,
  React.ComponentPropsWithoutRef<typeof TabsList>
>(({ className, ...props }, ref) => (
  <TabsList
    ref={ref}
    className={cn(
      "bg-white/5 border border-white/10 rounded-2xl p-1 gap-1",
      className
    )}
    {...props}
  />
));
PageTabsList.displayName = "PageTabsList";

const PageTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsTrigger>,
  React.ComponentPropsWithoutRef<typeof TabsTrigger>
>(({ className, ...props }, ref) => (
  <TabsTrigger
    ref={ref}
    className={cn(
      "rounded-xl flex items-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-wider",
      "text-white/50 transition-all cursor-pointer",
      "data-[state=active]:bg-brand-pink data-[state=active]:text-white",
      "data-[state=active]:shadow-lg data-[state=active]:shadow-brand-pink/30",
      className
    )}
    {...props}
  />
));
PageTabsTrigger.displayName = "PageTabsTrigger";

export { PageTabsList, PageTabsTrigger };
