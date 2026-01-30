import React from "react";
import { cn } from "@/lib/utils";

interface LogoLoadingProps {
  className?: string;
  size?: number;
  minimal?: boolean;
}

export const LogoLoading: React.FC<LogoLoadingProps> = ({ className, size = 64, minimal = false }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative">
        {/* Glow Effect */}
        <div 
          className="absolute inset-0 bg-brand-cyan/20 blur-2xl rounded-full animate-pulse" 
          style={{ width: size * 1.5, height: size * 1.5, left: -size * 0.25, top: -size * 0.25 }}
        />
        
        {/* Logo with Pulse */}
        <img
          src="/logo.png"
          alt="Carregando..."
          className="relative animate-pulse grayscale brightness-200 contrast-100"
          style={{ width: size, height: "auto" }}
        />
      </div>
      
      {/* Optional Loading Text */}
      {!minimal && (
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 animate-pulse">
          Processando...
        </span>
      )}
    </div>
  );
};
