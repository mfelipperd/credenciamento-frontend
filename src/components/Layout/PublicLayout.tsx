import type { ReactNode } from "react";
import { BasicFooter } from "@/components/Footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">{children}</div>
      <BasicFooter />
    </div>
  );
};
