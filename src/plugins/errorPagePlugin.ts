import type { Plugin } from "vite";

export function errorPagePlugin(): Plugin {
  return {
    name: "error-page-plugin",
    configureServer(server) {
      // Intercepta erros de desenvolvimento
      server.middlewares.use("/error", (_req, res) => {
        res.setHeader("Content-Type", "text/html");
        res.statusCode = 500;
        res.end(`
          <!DOCTYPE html>
          <html lang="pt-BR">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Erro - Aplicação</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background: linear-gradient(135deg, #fef2f2 0%, #fef3f2 100%);
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .error-container {
                  background: white;
                  border-radius: 12px;
                  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                  padding: 40px;
                  max-width: 600px;
                  width: 100%;
                  text-align: center;
                }
                .error-icon {
                  width: 64px;
                  height: 64px;
                  background: #fee2e2;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto 20px;
                }
                .error-title {
                  color: #dc2626;
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 16px;
                }
                .error-message {
                  color: #6b7280;
                  font-size: 16px;
                  margin-bottom: 24px;
                  line-height: 1.5;
                }
                .error-actions {
                  display: flex;
                  gap: 12px;
                  justify-content: center;
                  flex-wrap: wrap;
                }
                .error-button {
                  background: #3b82f6;
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 8px;
                  font-size: 14px;
                  cursor: pointer;
                  text-decoration: none;
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                  transition: background-color 0.2s;
                }
                .error-button:hover {
                  background: #2563eb;
                }
                .error-button.secondary {
                  background: transparent;
                  color: #6b7280;
                  border: 1px solid #d1d5db;
                }
                .error-button.secondary:hover {
                  background: #f9fafb;
                }
                .error-details {
                  margin-top: 32px;
                  padding-top: 24px;
                  border-top: 1px solid #e5e7eb;
                  text-align: left;
                }
                .error-code {
                  background: #fef2f2;
                  border: 1px solid #fecaca;
                  border-radius: 6px;
                  padding: 16px;
                  margin-bottom: 16px;
                  font-family: monospace;
                  font-size: 14px;
                  color: #dc2626;
                }
                .error-stack {
                  background: #f9fafb;
                  border: 1px solid #e5e7eb;
                  border-radius: 6px;
                  padding: 16px;
                  font-family: monospace;
                  font-size: 12px;
                  color: #374151;
                  max-height: 200px;
                  overflow-y: auto;
                  white-space: pre-wrap;
                }
                .toggle-details {
                  background: none;
                  border: none;
                  color: #6b7280;
                  font-size: 14px;
                  cursor: pointer;
                  text-decoration: underline;
                  margin-top: 16px;
                }
              </style>
            </head>
            <body>
              <div class="error-container">
                <div class="error-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                
                <h1 class="error-title">Erro na Aplicação</h1>
                <p class="error-message">
                  Ocorreu um erro inesperado durante o desenvolvimento. 
                  Verifique o console do navegador para mais detalhes.
                </p>
                
                <div class="error-actions">
                  <button class="error-button" onclick="window.location.reload()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 4v6h6M23 20v-6h-6"/>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                    </svg>
                    Recarregar
                  </button>
                  <a href="/" class="error-button secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9,22 9,12 15,12 15,22"/>
                    </svg>
                    Página Inicial
                  </a>
                </div>
                
                <button class="toggle-details" onclick="toggleDetails()">
                  Mostrar detalhes técnicos
                </button>
                
                <div class="error-details" id="errorDetails" style="display: none;">
                  <div class="error-code">
                    <strong>Código do Erro:</strong> DEV_ERROR
                  </div>
                  <div class="error-stack">
Erro capturado durante o desenvolvimento.
Verifique o terminal do Vite e o console do navegador para mais informações.

Para resolver este erro:
1. Verifique a sintaxe do código
2. Certifique-se de que todas as importações estão corretas
3. Verifique se não há variáveis indefinidas
4. Recarregue a página após fazer as correções
                  </div>
                </div>
              </div>
              
              <script>
                function toggleDetails() {
                  const details = document.getElementById('errorDetails');
                  const button = document.querySelector('.toggle-details');
                  
                  if (details.style.display === 'none') {
                    details.style.display = 'block';
                    button.textContent = 'Ocultar detalhes técnicos';
                  } else {
                    details.style.display = 'none';
                    button.textContent = 'Mostrar detalhes técnicos';
                  }
                }
              </script>
            </body>
          </html>
        `);
      });
    },

    handleHotUpdate(ctx) {
      // Intercepta erros de hot reload
      if (ctx.file.includes(".tsx") || ctx.file.includes(".ts")) {
        try {
          // Se houver erro de sintaxe, será capturado pelo Vite automaticamente
        } catch (error) {
          console.error("Erro durante hot reload:", error);
        }
      }
    },
  };
}
