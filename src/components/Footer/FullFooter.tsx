import { Linkedin, Github, ExternalLink, Mail, MapPin } from "lucide-react";

export const FullFooter = () => {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-12 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Informações do Sistema */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">
              Sistema de Credenciamento
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Plataforma profissional para gestão de visitantes e credenciamento
              de eventos. Desenvolvida especialmente para a Expo Multimix.
            </p>
          </div>

          {/* Informações da Feira */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Expo Multimix</h3>
            <div className="space-y-3">
              <p className="text-slate-400 text-sm leading-relaxed">
                A maior feira multissetorial do Brasil, reunindo empresas e
                profissionais de diversos segmentos.
              </p>
              <div className="space-y-2">
                <a
                  href="https://www.expomultimix.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group"
                >
                  <ExternalLink
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  Site Oficial
                </a>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <MapPin size={16} />
                  Centro de Convenções
                </div>
              </div>
            </div>
          </div>

          {/* Desenvolvedor */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Desenvolvedor</h3>
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">
                <strong className="text-white">Marcos Felippe</strong>
                <br />
                Desenvolvedor Full Stack
                <br />
                Especialista em React & Node.js
              </p>
              <div className="space-y-2">
                <a
                  href="https://linkedin.com/in/marcosfelippe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm group"
                >
                  <Linkedin
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  LinkedIn
                </a>
                <a
                  href="https://github.com/mfelipperd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group"
                >
                  <Github
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  GitHub
                </a>
                <a
                  href="mailto:contato@marcosfelippe.dev"
                  className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors text-sm group"
                >
                  <Mail
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  Contato
                </a>
              </div>
            </div>
          </div>

          {/* Agência Organizadora */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Organização</h3>
            <div className="space-y-3">
              <p className="text-slate-400 text-sm leading-relaxed">
                Evento organizado pela equipe Multimix com mais de 20 anos de
                experiência em feiras e eventos corporativos.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <ExternalLink size={16} />
                  Agência Multimix
                </div>
                <a
                  href="https://linkedin.com/company/expomultimix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm group"
                >
                  <Linkedin
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  LinkedIn da Feira
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Linha de Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-slate-500 text-sm">
            <p>
              © {new Date().getFullYear()} Sistema de Credenciamento. Todos os
              direitos reservados.
            </p>
            <p>Expo Multimix • Desenvolvido por Marcos Felippe • v{__APP_VERSION__}</p>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <span>Feito com</span>
            <span className="text-red-400 animate-pulse">❤️</span>
            <span>para a comunidade</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
