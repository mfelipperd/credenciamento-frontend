export const SimpleFooter = () => {
  return (
    <footer className="bg-slate-800 dark:bg-slate-900 text-slate-400 py-3 px-6 border-t border-slate-700">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
        <p>
          © {new Date().getFullYear()} Sistema de Credenciamento • Desenvolvido
          por Marcos Felippe
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://www.expomultimix.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Expo Multimix
          </a>
          <a
            href="https://github.com/mfelipperd"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};
