export const BasicFooter = () => {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-6 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <p className="text-slate-300 font-medium">
            Sistema de Credenciamento
          </p>
          <p className="text-sm">
            Desenvolvido por Marcos Felippe para Expo Multimix
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm">
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
          <p className="text-slate-500">© {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
};
