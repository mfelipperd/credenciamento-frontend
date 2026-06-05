# Clientes (Expositores) & Marcas — Guia de Implementação Frontend

> Stack: React + TypeScript  
> Base URL: `https://credenciamento-api-production.up.railway.app`  
> Auth: `Authorization: Bearer <access_token>` (exceto endpoint público de marcas)

---

## Conceitos

| Entidade    | Tabela             | O que é                                                           |
| ----------- | ------------------ | ----------------------------------------------------------------- |
| **Client**  | `finance_clients`  | O expositor — empresa ou pessoa que compra stand(s) na feira      |
| **Brand**   | `finance_brands`   | Marca que o expositor representa (um expositor pode ter N marcas) |
| **Revenue** | `finance_revenues` | O contrato de compra do stand (vincula Client → Stand)            |
| **Stand**   | `stands`           | O stand físico na feira                                           |

**Fluxo de negócio:**

```
Admin cadastra o Client (expositor)
  → cria as Brands do expositor (com logo)
  → cria uma Revenue (contrato) ligando Client ao Stand
    → Stand fica marcado como ocupado (isAvailable = false)
    → Parcelas (installments) são geradas automaticamente
```

Um expositor **pode ter múltiplas marcas** — por exemplo, uma empresa que representa três linhas de produto diferentes. O site da feira pode exibir todas essas marcas.

---

## Storage de Imagens

O upload de logos utiliza o **ImgBB** (gratuito — 32 MB/imagem, sem limite de armazenamento no plano free).

**Variável de ambiente necessária na Railway:**

```
IMGBB_API_KEY=sua_chave_aqui
```

Sem a chave, o sistema faz fallback para storage local (`/uploads/brands/`). Em produção na Railway, configure sempre o ImgBB.

**Obter chave gratuita:** [api.imgbb.com](https://api.imgbb.com) → Sign up → API Key

---

## Tipos TypeScript

```typescript
// types/clients.ts

export interface Client {
  id: string;
  fairId: string;
  name: string;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  responsavel: string | null; // nome do contato responsável
  brands: Brand[];
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  clientId: string;
  name: string;
  logoUrl: string; // URL do ImgBB ou local
  createdAt: string;
  updatedAt: string;
}

// Payload de criação
export interface CreateClientPayload {
  fairId: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  responsavel?: string;
}

export interface UpdateClientPayload {
  name?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  responsavel?: string;
}
```

---

## Endpoints — Clientes (autenticado)

### `POST /finance/clients`

Cria um novo expositor.

**Body (JSON):**

```json
{
  "fairId": "uuid-da-feira",
  "name": "Empresa X Ltda",
  "cnpj": "12.345.678/0001-99",
  "email": "contato@empresax.com.br",
  "phone": "(91) 99999-0000",
  "responsavel": "João Silva"
}
```

**Resposta:** `Client` com `brands: []`

---

### `GET /finance/clients`

Lista todos os clientes. Aceita filtros via query string.

| Query param | Tipo   | Descrição             |
| ----------- | ------ | --------------------- |
| `fairId`    | UUID   | Filtra por feira      |
| `search`    | string | Busca por nome (LIKE) |

```
GET /finance/clients?fairId=<uuid>
GET /finance/clients?search=empresa&fairId=<uuid>
```

**Resposta:** `Client[]` (com `brands` incluídas)

---

### `GET /finance/clients/:id`

Busca expositor por ID. Inclui suas marcas.

**Resposta:** `Client` com `brands[]`

---

### `PATCH /finance/clients/:id`

Atualiza dados do expositor.

**Body (JSON parcial):**

```json
{
  "name": "Novo Nome",
  "phone": "(91) 98888-1111"
}
```

---

### `DELETE /finance/clients/:id`

Remove o expositor e todas as suas marcas (logos excluídos automaticamente).

---

### `GET /finance/clients/email/:email`

Busca expositor pelo e-mail.

### `GET /finance/clients/cnpj/:cnpj`

Busca expositor pelo CNPJ (formato livre, sem máscara).

---

## Endpoints — Marcas (autenticado)

### `POST /finance/clients/:id/brands`

Adiciona uma marca ao expositor. **Usa `multipart/form-data`.**

| Campo  | Tipo                | Obrigatório |
| ------ | ------------------- | ----------- |
| `name` | string              | Sim         |
| `logo` | File (JPG/PNG/WEBP) | Sim         |

```typescript
const formData = new FormData();
formData.append("name", "Nome da Marca");
formData.append("logo", file); // objeto File do input

await fetch(`${BASE}/finance/clients/${clientId}/brands`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  // NÃO adicione Content-Type — o browser define o boundary automaticamente
  body: formData,
});
```

**Resposta:** `Brand`

---

### `PATCH /finance/brands/:id`

Atualiza nome e/ou logo de uma marca. **Usa `multipart/form-data`.**

| Campo  | Tipo   | Obrigatório |
| ------ | ------ | ----------- |
| `name` | string | Não         |
| `logo` | File   | Não         |

Se `logo` for enviado, a imagem anterior é excluída e a nova é hospedada no ImgBB.

**Resposta:** `Brand`

---

### `DELETE /finance/brands/:id`

Remove uma marca e seu logo.

---

## Endpoint Público — Site da Feira

### `GET /finance/brands?fairId=<uuid>`

**Não requer autenticação.** Retorna todas as marcas de todos os expositores daquela feira.

```typescript
// Sem token de auth
const res = await fetch(`${BASE}/finance/brands?fairId=${fairId}`);
const brands: Brand[] = await res.json();
```

**Resposta:** `Brand[]` (cada item já inclui `client` como relação)

---

## Hooks React

```typescript
// hooks/useClients.ts

const BASE = "https://credenciamento-api-production.up.railway.app";

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  };
}

// ─── Clientes ─────────────────────────────────────────────────────────────

export async function getClients(
  fairId: string,
  search?: string,
): Promise<Client[]> {
  const params = new URLSearchParams({ fairId });
  if (search) params.set("search", search);
  const res = await fetch(`${BASE}/finance/clients?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar clientes");
  return res.json();
}

export async function getClient(id: string): Promise<Client> {
  const res = await fetch(`${BASE}/finance/clients/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Cliente não encontrado");
  return res.json();
}

export async function createClient(data: CreateClientPayload): Promise<Client> {
  const res = await fetch(`${BASE}/finance/clients`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function updateClient(
  id: string,
  data: UpdateClientPayload,
): Promise<Client> {
  const res = await fetch(`${BASE}/finance/clients/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function deleteClient(id: string): Promise<void> {
  await fetch(`${BASE}/finance/clients/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

// ─── Marcas ────────────────────────────────────────────────────────────────

export async function addBrand(
  clientId: string,
  name: string,
  logo: File,
): Promise<Brand> {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("logo", logo);

  const res = await fetch(`${BASE}/finance/clients/${clientId}/brands`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function updateBrand(
  id: string,
  name?: string,
  logo?: File,
): Promise<Brand> {
  const formData = new FormData();
  if (name) formData.append("name", name);
  if (logo) formData.append("logo", logo);

  const res = await fetch(`${BASE}/finance/brands/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: formData,
  });
  return res.json();
}

export async function deleteBrand(id: string): Promise<void> {
  await fetch(`${BASE}/finance/brands/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

// ─── Público (site) ────────────────────────────────────────────────────────

export async function getPublicBrands(fairId: string): Promise<Brand[]> {
  const res = await fetch(`${BASE}/finance/brands?fairId=${fairId}`);
  return res.json();
}
```

---

## Implementação de UI

### Tela de listagem de expositores

```tsx
// ClientsPage.tsx
import React, { useEffect, useState } from "react";
import { getClients, createClient, deleteClient } from "../hooks/useClients";

export function ClientsPage({ fairId }: { fairId: string }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await getClients(fairId, search || undefined);
    setClients(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [fairId, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este expositor e todas as suas marcas?")) return;
    await deleteClient(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar expositor..."
          className="input input-bordered flex-1"
        />
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Novo Expositor
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <ClientsSkeleton />
      ) : clients.length === 0 ? (
        <EmptyState
          title="Nenhum expositor cadastrado"
          description="Adicione os expositores que compraram stands nesta feira."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onDelete={() => handleDelete(client.id)}
              onUpdate={(updated) =>
                setClients((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c)),
                )
              }
            />
          ))}
        </div>
      )}

      {/* Modal de criação */}
      {showForm && (
        <CreateClientModal
          fairId={fairId}
          onClose={() => setShowForm(false)}
          onCreated={(client) => {
            setClients((prev) => [client, ...prev]);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
```

### Card de expositor com gestão de marcas

```tsx
// ClientCard.tsx
import React, { useState } from "react";
import { addBrand, updateBrand, deleteBrand } from "../hooks/useClients";

interface Props {
  client: Client;
  onDelete: () => void;
  onUpdate: (client: Client) => void;
}

export function ClientCard({ client, onDelete, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [brands, setBrands] = useState<Brand[]>(client.brands ?? []);
  const [uploading, setUploading] = useState(false);

  const handleAddBrand = async (name: string, file: File) => {
    setUploading(true);
    try {
      const brand = await addBrand(client.id, name, file);
      setBrands((prev) => [...prev, brand]);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    await deleteBrand(brandId);
    setBrands((prev) => prev.filter((b) => b.id !== brandId));
  };

  return (
    <div className="card bg-base-100 shadow border rounded-xl">
      {/* Header do expositor */}
      <div className="card-body pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-lg truncate">{client.name}</h3>
            {client.cnpj && (
              <p className="text-sm text-gray-500">CNPJ: {client.cnpj}</p>
            )}
            {client.responsavel && (
              <p className="text-sm text-gray-500">
                Responsável: {client.responsavel}
              </p>
            )}
            {client.email && (
              <p className="text-xs text-gray-400 truncate">{client.email}</p>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="btn btn-sm btn-outline gap-1"
            >
              {expanded ? "▲" : "▼"} Marcas ({brands.length})
            </button>
            <button
              onClick={onDelete}
              className="btn btn-sm btn-error btn-outline"
            >
              Remover
            </button>
          </div>
        </div>

        {/* Preview de logos (fechado) */}
        {!expanded && brands.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {brands.map((b) => (
              <img
                key={b.id}
                src={b.logoUrl}
                alt={b.name}
                title={b.name}
                className="w-10 h-10 object-contain rounded border bg-gray-50 p-1"
              />
            ))}
          </div>
        )}
      </div>

      {/* Área de marcas (expandida) */}
      {expanded && (
        <div className="border-t px-6 py-4">
          <BrandsManager
            brands={brands}
            onAdd={handleAddBrand}
            onDelete={handleDeleteBrand}
            uploading={uploading}
          />
        </div>
      )}
    </div>
  );
}
```

### Gerenciador de marcas

```tsx
// BrandsManager.tsx
import React, { useRef, useState } from "react";

interface Props {
  brands: Brand[];
  onAdd: (name: string, file: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  uploading: boolean;
}

export function BrandsManager({ brands, onAdd, onDelete, uploading }: Props) {
  const [newName, setNewName] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newFile) return;
    await onAdd(newName, newFile);
    setNewName("");
    setNewFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <h4 className="font-semibold text-sm text-gray-600 mb-3">
        Marcas do Expositor
      </h4>

      {/* Formulário de adição */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex gap-3 items-end flex-wrap">
          {/* Preview do logo */}
          <div
            className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <img
                src={preview}
                className="w-full h-full object-contain"
                alt="preview"
              />
            ) : (
              <div className="text-center">
                <div className="text-2xl">📷</div>
                <div className="text-[9px] text-gray-400">Logo*</div>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Nome da marca */}
          <div className="flex-1 min-w-32">
            <label className="label py-0 mb-1">
              <span className="label-text text-xs">Nome da marca *</span>
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Linha Premium"
              className="input input-bordered input-sm w-full"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={!newName.trim() || !newFile || uploading}
            className="btn btn-primary btn-sm"
          >
            {uploading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "+ Adicionar"
            )}
          </button>
        </div>
      </div>

      {/* Lista de marcas */}
      {brands.length === 0 ? (
        <p className="text-sm text-center text-gray-400 py-4">
          Nenhuma marca cadastrada ainda.
        </p>
      ) : (
        <div className="grid gap-2">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="w-12 h-12 object-contain rounded border bg-white p-1 flex-shrink-0"
              />
              <span className="flex-1 font-medium text-sm">{brand.name}</span>
              <button
                onClick={() => onDelete(brand.id)}
                className="btn btn-xs btn-error btn-outline"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Vitrine Pública de Marcas (site da feira)

```tsx
// BrandsShowcase.tsx — para o site da feira, sem autenticação
import React, { useEffect, useState } from "react";
import { getPublicBrands } from "../hooks/useClients";

export function BrandsShowcase({ fairId }: { fairId: string }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicBrands(fairId)
      .then(setBrands)
      .finally(() => setLoading(false));
  }, [fairId]);

  if (loading) return <BrandsShowcaseSkeleton />;
  if (brands.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">
          Marcas Participantes
        </h2>
        <p className="text-center text-gray-500 mb-10">
          Conheça as empresas e marcas presentes nesta edição
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:shadow-md transition-shadow"
            >
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="w-24 h-24 object-contain grayscale hover:grayscale-0 transition-all duration-300"
              />
              <span className="text-sm font-medium text-center text-gray-700 leading-tight">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Onde encaixar na navegação (admin)

```
/admin/fairs/:fairId
  ├─ /overview          (KPIs gerais)
  ├─ /visitors          (inscrições e check-ins)
  ├─ /finances          (receitas, despesas, fluxo de caixa)
  ├─ /exhibitors        ← ESTA ÁREA (Expositores + Marcas)
  └─ /settings
```

**Menu item sugerido:** ícone de `Building2` ou `Store` com label "Expositores".

**Alertas a mostrar na listagem:**

- Expositor sem nenhuma marca → badge amarelo `Sem marcas`
- Expositor sem email ou telefone → badge cinza `Dados incompletos`

---

## Configuração de Storage na Railway

Para que o upload de logos funcione em produção, configure no painel da Railway:

```
IMGBB_API_KEY=<sua chave gratuita>
```

**Obter a chave:** [api.imgbb.com](https://api.imgbb.com) → conta gratuita → Dashboard → API Key

Sem essa variável, os arquivos são salvos em `/uploads/` no disco da Railway (efêmero — reinicialização apaga tudo). **Sempre configure o ImgBB em produção.**

---

## Prompt completo para IA

```
Você é um desenvolvedor frontend React + TypeScript integrando a API de expositores e marcas de uma plataforma de feiras.

CONTEXTO:
- Base URL: https://credenciamento-api-production.up.railway.app
- Auth: Bearer token no header Authorization (exceto endpoint público GET /finance/brands)
- "Client" (tabela finance_clients) = expositor que compra stand na feira
- "Brand" (tabela finance_brands) = marca que o expositor representa (1 expositor : N marcas)
- Logos são enviados via multipart/form-data e hospedados no ImgBB (URL HTTPS retornada)

TIPOS:
Client { id, fairId, name, cnpj?, email?, phone?, responsavel?, brands: Brand[], createdAt, updatedAt }
Brand  { id, clientId, name, logoUrl, createdAt, updatedAt }

ENDPOINTS AUTENTICADOS:
POST   /finance/clients                  Criar expositor (JSON)
GET    /finance/clients?fairId=&search=  Listar (com marcas incluídas)
GET    /finance/clients/:id              Buscar por ID
PATCH  /finance/clients/:id             Atualizar (JSON parcial)
DELETE /finance/clients/:id             Remover (cascata: remove marcas e logos)
GET    /finance/clients/email/:email    Buscar por email
GET    /finance/clients/cnpj/:cnpj      Buscar por CNPJ

POST   /finance/clients/:id/brands     Adicionar marca (multipart: name + logo*)
PATCH  /finance/brands/:id             Atualizar marca (multipart: name? + logo?)
DELETE /finance/brands/:id             Remover marca

ENDPOINT PÚBLICO (sem auth):
GET    /finance/brands?fairId=<uuid>   Todas as marcas de uma feira (para o site)

REGRAS DE UPLOAD DE LOGO:
- Campo do form: "logo"
- Content-Type: NÃO definir manualmente (FormData define o boundary)
- Formatos aceitos: qualquer imagem (JPG, PNG, WEBP, SVG...)
- A resposta retorna o objeto Brand com logoUrl preenchido

IMPLEMENTAÇÃO NECESSÁRIA:
1. Página /admin/fairs/:fairId/exhibitors
   - Lista de expositores com busca por nome
   - Card expansível por expositor
   - Header do card: nome, CNPJ, responsável, email
   - Cards fechados: preview dos logos em miniatura (40×40px)
   - Botão expandir: mostra BrandsManager completo
   - Botão criar: modal com formulário de novo expositor

2. BrandsManager (dentro do card expandido)
   - Formulário inline: preview de logo clicável (clica → abre file picker), input de nome, botão adicionar
   - Lista de marcas cadastradas: logo 48×48, nome, botão remover
   - Estado de loading durante upload
   - Preview local imediato do arquivo selecionado (URL.createObjectURL)

3. BrandsShowcase (componente para site público)
   - Grid responsivo: 2 colunas mobile, 4-6 colunas desktop
   - Logos grayscale → colorido no hover
   - Sem autenticação (chama /finance/brands?fairId= diretamente)

DESIGN MOBILE-FIRST:
- Cards full-width no mobile
- Input de busca full-width no mobile
- BrandsManager: preview 64×64 no mobile
- Skeleton loading para todos os estados
```
