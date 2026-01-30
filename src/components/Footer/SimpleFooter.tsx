import React from "react";

export const SimpleFooter: React.FC = () => {
  return (
    <footer className="bg-brand-blue text-white/40 py-6 px-10 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest">
        <p className="opacity-60 text-center sm:text-left">
          © {new Date().getFullYear()} Sistema de Credenciamento • <span className="text-brand-cyan">Expo Multi Mix</span>
        </p>
        <div className="flex items-center gap-8">
          <a
            href="https://www.expomultimix.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-pink transition-all duration-300"
          >
            Site Oficial
          </a>
          <a
            href="https://github.com/mfelipperd"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-cyan transition-all duration-300"
          >
            Suporte Técnico
          </a>
        </div>
      </div>
    </footer>
  );
};
