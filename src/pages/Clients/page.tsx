import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Images, Plus, Search, Users, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useExhibitorsService } from "@/service/exhibitors.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList, PageTabsTrigger } from "@/components/ui/page-tabs";
import { FairGalleryTab } from "./components/FairGalleryTab";
import type { Exhibitor, ExhibitorType } from "@/interfaces/exhibitors";
import { exhibitorTypeLabels, memberRoleLabels, participationStatusLabels, credentialStatusLabels } from "@/interfaces/exhibitors";

export function ClientsPage() {
  const [, , fairId] = useSearchParams();
  const service = useExhibitorsService();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Exhibitor | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [type, setType] = useState<ExhibitorType>("OTHER");
  const { data: exhibitors = [], isLoading } = useQuery({ queryKey: ["exhibitors"], queryFn: service.list });
  const filtered = useMemo(() => exhibitors.filter(e => `${e.name} ${e.cnpj ?? ""}`.toLowerCase().includes(search.toLowerCase())), [exhibitors, search]);
  const create = useMutation({ mutationFn: service.create, onSuccess: async (item) => { await queryClient.invalidateQueries({ queryKey: ["exhibitors"] }); setCreating(false); setName(""); setCnpj(""); setSelected(item); toast.success("Expositor cadastrado com sucesso"); }, onError: () => toast.error("Não foi possível cadastrar o expositor") });

  return (
    <div className="min-h-screen space-y-6 p-4 pb-10 text-white sm:p-6">
      <Tabs defaultValue="exhibitors" className="space-y-6">
        <div className="flex flex-col gap-5 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:items-end">
          <div><p className="mb-1 text-[10px] font-black uppercase tracking-[.2em] text-white/40">Organizações e credenciais</p><h1 className="flex items-center gap-3 text-4xl font-black tracking-tighter"><Building2 className="h-8 w-8 text-brand-pink" />Gestão de <span className="text-brand-cyan">Expositores</span></h1><p className="mt-1 text-sm text-white/40">Empresas, equipes e participações em feiras</p></div>
          <PageTabsList><PageTabsTrigger value="exhibitors"><Building2 className="h-4 w-4" />Expositores</PageTabsTrigger><PageTabsTrigger value="gallery"><Images className="h-4 w-4" />Galeria</PageTabsTrigger></PageTabsList>
          <div className="flex xl:justify-end"><Button onClick={() => setCreating(true)} className="bg-linear-to-br from-brand-cyan to-brand-pink font-bold text-white"><Plus className="mr-2 h-4 w-4" />Novo expositor</Button></div>
        </div>
        <TabsContent value="gallery"><FairGalleryTab fairId={fairId} /></TabsContent>
        <TabsContent value="exhibitors" className="space-y-4">
          <div className="flex flex-wrap gap-3"><Stat icon={<Building2 />} value={exhibitors.length} label="Expositores" /><Stat icon={<Users />} value={exhibitors.reduce((n,e)=>n+e.financeClients.length,0)} label="Vínculos financeiros" /><Stat icon={<WalletCards />} value={exhibitors.filter(e=>e.financeClients.length>0).length} label="Com cliente financeiro" /></div>
          <div className="relative max-w-lg"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" /><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar expositor por nome ou CNPJ..." className="border-white/10 bg-white/5 pl-9 text-white" /></div>
          {isLoading ? <p className="py-16 text-center text-white/40">Carregando expositores...</p> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map(e=><button key={e.id} onClick={()=>setSelected(e)} className="glass-card rounded-2xl border border-white/5 p-4 text-left transition hover:border-brand-cyan/30 hover:bg-white/5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-bold text-white">{e.name}</h3><p className="mt-1 text-xs text-white/40">{e.cnpj || "CNPJ não informado"}</p></div><Badge variant="outline" className="shrink-0 text-white/60">{exhibitorTypeLabels[e.type]}</Badge></div><div className="mt-4 flex items-center justify-between text-xs text-white/40"><span>{e.financeClients.length} vínculo(s) financeiro(s)</span><span className={e.isActive?"text-green-400":"text-red-400"}>{e.isActive?"Ativo":"Inativo"}</span></div></button>)}</div>}
        </TabsContent>
      </Tabs>
      <Dialog open={creating} onOpenChange={setCreating}><DialogContent><DialogHeader><DialogTitle>Novo expositor</DialogTitle></DialogHeader><div className="space-y-4"><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome da empresa ou marca" /><Input value={cnpj} onChange={e=>setCnpj(e.target.value)} placeholder="CNPJ (opcional)" /><Select value={type} onValueChange={v=>setType(v as ExhibitorType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(exhibitorTypeLabels).map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select><Button disabled={!name.trim()||create.isPending} onClick={()=>create.mutate({name:name.trim(),cnpj:cnpj||undefined,type})} className="w-full">{create.isPending?"Salvando...":"Cadastrar expositor"}</Button></div></DialogContent></Dialog>
      <ExhibitorDetails exhibitor={selected} onClose={()=>setSelected(null)} />
    </div>
  );
}

function ExhibitorDetails({ exhibitor, onClose }: { exhibitor: Exhibitor | null; onClose: () => void }) {
  const service = useExhibitorsService();
  const id = exhibitor?.id ?? "";
  const { data: team = [], isLoading: loadingTeam } = useQuery({ queryKey:["exhibitors",id,"team"], queryFn:()=>service.team(id), enabled:!!id });
  const { data: fairs = [], isLoading: loadingFairs } = useQuery({ queryKey:["exhibitors",id,"fairs"], queryFn:()=>service.fairs(id), enabled:!!id });
  return <Dialog open={!!exhibitor} onOpenChange={open=>!open&&onClose()}><DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto"><DialogHeader><DialogTitle>{exhibitor?.name}</DialogTitle></DialogHeader>{exhibitor&&<Tabs defaultValue="general" className="space-y-4"><PageTabsList className="h-auto flex-wrap"><PageTabsTrigger value="general">Dados gerais</PageTabsTrigger><PageTabsTrigger value="team">Equipe ({team.length})</PageTabsTrigger><PageTabsTrigger value="fairs">Feiras ({fairs.length})</PageTabsTrigger><PageTabsTrigger value="finance">Clientes financeiros ({exhibitor.financeClients.length})</PageTabsTrigger></PageTabsList><TabsContent value="general" className="grid gap-3 sm:grid-cols-2"><Info label="Nome" value={exhibitor.name}/><Info label="Tipo" value={exhibitorTypeLabels[exhibitor.type]}/><Info label="CNPJ" value={exhibitor.cnpj||"Não informado"}/><Info label="Situação" value={exhibitor.isActive?"Ativo":"Inativo"}/></TabsContent><TabsContent value="team">{loadingTeam?<Loading/>:<div className="space-y-2">{team.map(m=><Row key={m.id} title={m.name} subtitle={`${memberRoleLabels[m.role]}${m.jobTitle?` • ${m.jobTitle}`:""}`} meta={m.userId?"Acesso ativo":"Sem acesso ao sistema"}/>)}</div>}</TabsContent><TabsContent value="fairs">{loadingFairs?<Loading/>:<div className="space-y-3">{fairs.map(f=><div key={f.id} className="rounded-xl border border-white/10 p-4"><div className="flex justify-between"><b>{f.fair.name}</b><Badge>{participationStatusLabels[f.status]}</Badge></div><div className="mt-3 space-y-2">{f.members.map(c=><Row key={c.id} title={c.member.name} subtitle={c.credentialCode} meta={credentialStatusLabels[c.status]}/>)}</div></div>)}</div>}</TabsContent><TabsContent value="finance" className="space-y-2">{exhibitor.financeClients.map(link=><Row key={link.id} title={link.client.name} subtitle={link.client.cnpj||"Sem CNPJ"} meta="Vinculado"/>)}</TabsContent></Tabs>}</DialogContent></Dialog>;
}

function Stat({icon,value,label}:{icon:ReactNode;value:number;label:string}) { return <div className="glass-card flex items-center gap-3 rounded-xl border border-white/5 px-4 py-3"><span className="text-brand-cyan [&_svg]:h-4 [&_svg]:w-4">{icon}</span><b>{value}</b><span className="text-xs text-white/40">{label}</span></div> }
function Info({label,value}:{label:string;value:string}) { return <div className="rounded-xl border border-white/10 p-4"><p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p><p className="mt-1 font-semibold">{value}</p></div> }
function Row({title,subtitle,meta}:{title:string;subtitle:string;meta:string}) { return <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3"><div><p className="font-semibold">{title}</p><p className="text-xs text-white/40">{subtitle}</p></div><span className="text-xs text-white/50">{meta}</span></div> }
function Loading(){return <p className="py-10 text-center text-white/40">Carregando...</p>}
