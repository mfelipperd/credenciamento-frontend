import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CalendarDays, Images, Plus, Search, Store, Users } from "lucide-react";
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
import { exhibitorTypeLabels, memberRoleLabels } from "@/interfaces/exhibitors";

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
          <div className="flex flex-wrap gap-3"><Stat icon={<Building2 />} value={exhibitors.length} label="Expositores" /><Stat icon={<Users />} value={exhibitors.reduce((n,e)=>n+e.peopleCount,0)} label="Pessoas" /><Stat icon={<Store />} value={exhibitors.reduce((n,e)=>n+e.standCount,0)} label="Stands" /></div>
          <div className="relative max-w-lg"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" /><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar expositor por nome ou CNPJ..." className="border-white/10 bg-white/5 pl-9 text-white" /></div>
          {isLoading ? <p className="py-16 text-center text-white/40">Carregando expositores...</p> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map(e=><ExhibitorListCard key={e.id} exhibitor={e} onClick={()=>setSelected(e)} />)}</div>}
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
  const { data, isLoading, error } = useQuery({ queryKey:["exhibitors",id,"details"], queryFn:()=>service.details(id), enabled:!!id, staleTime:5*60*1000 });
  return (
    <Dialog open={!!exhibitor} onOpenChange={open => !open && onClose()}>
      <DialogContent className="h-[94vh] w-[96vw] max-w-[96vw] overflow-y-auto p-4 sm:max-w-[94vw] sm:p-6 xl:max-w-[1500px]">
        {isLoading ? <Loading /> : error ? (
          <p className="py-20 text-center text-red-400">Não foi possível carregar o expositor.</p>
        ) : data && (
          <div className="space-y-6">
            <DialogHeader className="border-b border-white/10 pb-5 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{exhibitorTypeLabels[data.exhibitor.type]}</Badge>
                <Badge className={data.exhibitor.isActive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}>{data.exhibitor.isActive ? "Ativo" : "Inativo"}</Badge>
                <Badge className={financialStatusClass(data.financial.financialStatus)}>{financialLabel(data.financial.financialStatus)}</Badge>
                <Badge variant="secondary">{data.commercial.isRecurring ? "Cliente recorrente" : "Cliente novo"}</Badge>
              </div>
              <DialogTitle className="mt-3 text-2xl font-black sm:text-3xl">{data.exhibitor.name}</DialogTitle>
              <p className="text-xs text-white/40">{data.exhibitor.cnpj || "CNPJ não informado"} • Cliente há {data.commercial.yearsAsCustomer.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ano(s)</p>
            </DialogHeader>

            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <Metric label="Feiras" value={String(data.counts.fairs)} /><Metric label="Stands" value={String(data.counts.stands)} /><Metric label="Pessoas" value={String(data.counts.people)} /><Metric label="Credenciais ativas" value={String(data.counts.activeCredentials)} /><Metric label="Contratado" value={money(data.financial.totalContractedCents)} accent="text-brand-cyan" /><Metric label="Ticket médio" value={money(data.financial.averageStandTicketCents)} />
            </section>

            <Section title="Resumo financeiro">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric label="Total pago" value={money(data.financial.totalPaidCents)} accent="text-green-400" /><Metric label="Pendente" value={money(data.financial.totalPendingCents)} accent="text-amber-400" /><Metric label="Vencido" value={money(data.financial.totalOverdueCents)} accent="text-red-400" /><Metric label="Disponível para pagar" value={money(data.financial.availableToPayCents)} /></div>
            </Section>

            <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <Section title={`Histórico por feira (${data.fairFinancials.length})`}>
                <div className="space-y-2">{data.fairFinancials.map(f => <Row key={f.fairId} title={f.fairName} subtitle={`${f.standsPurchased} stand(s) • ${f.mappedStands} mapeado(s) • última compra ${date(f.lastStandPurchaseAt)}`} meta={money(f.standRevenueCents + f.sponsorshipRevenueCents)} />)}</div>
              </Section>
              <Section title="Relacionamento comercial">
                <div className="grid grid-cols-2 gap-3"><Info label="Primeira participação" value={date(data.commercial.firstParticipationAt)} /><Info label="Última participação" value={date(data.commercial.lastParticipationAt)} /><Info label="Taxa de participação" value={`${data.commercial.participationRate.toLocaleString("pt-BR")}%`} /><Info label="Feiras disponíveis" value={String(data.commercial.totalFairsAvailable)} /></div>
              </Section>
            </div>

            <Section title={`Compras de stands (${data.purchases.length})`}>
              <div className="grid gap-3 lg:grid-cols-2">{data.purchases.map(p => <div key={p.revenueId} className="rounded-xl border border-white/10 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{p.fairName}</p><p className="mt-1 text-xs text-white/40">Stand {p.standNumber ?? "não mapeado"} • {p.paymentMethod} • {p.numberOfInstallments} parcela(s)</p></div><Badge variant="outline">{p.status.replace("_", " ")}</Badge></div><p className="mt-3 text-lg font-black text-brand-cyan">{money(p.contractValueCents)}</p></div>)}</div>
            </Section>

            <div className="grid gap-6 lg:grid-cols-2">
              <Section title={`Equipe (${data.team.length})`}>{data.team.length ? <div className="space-y-2">{data.team.map(m => <Row key={m.id} title={m.name} subtitle={`${memberRoleLabels[m.role]}${m.jobTitle ? ` • ${m.jobTitle}` : ""}`} meta={m.userId ? "Acesso ativo" : "Sem acesso"} />)}</div> : <Empty label="Nenhum integrante cadastrado" />}</Section>
              <Section title="Contato e vínculos financeiros">{data.commercial.primaryContact && <div className="mb-3 rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-brand-cyan">Contato principal</p><p className="mt-2 font-bold">{data.commercial.primaryContact.name}</p><p className="text-xs text-white/45">{data.commercial.primaryContact.email || "Sem e-mail"} • {data.commercial.primaryContact.phone || "Sem telefone"}</p></div>}<div className="space-y-2">{data.financeClients.map(link => <Row key={link.id} title={link.client.name} subtitle={link.client.cnpj || link.client.email || "Sem documento ou contato"} meta="Financeiro" />)}</div></Section>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ExhibitorListCard({exhibitor,onClick}:{exhibitor:Exhibitor;onClick:()=>void}) { return <button onClick={onClick} className="glass-card rounded-2xl border border-white/5 p-4 text-left transition hover:border-brand-cyan/30 hover:bg-white/5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-bold text-white">{exhibitor.name}</h3><p className="mt-1 text-xs text-white/40">{exhibitor.cnpj||"CNPJ não informado"}</p></div><Badge variant="outline" className="shrink-0 text-white/60">{exhibitorTypeLabels[exhibitor.type]}</Badge></div><div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-3"><Count icon={<CalendarDays/>} value={exhibitor.fairCount} label="Feiras"/><Count icon={<Store/>} value={exhibitor.standCount} label="Stands"/><Count icon={<Users/>} value={exhibitor.peopleCount} label="Pessoas"/></div><div className="mt-3 flex items-end justify-between"><div><p className="text-[9px] uppercase tracking-wider text-white/30">Contratado</p><p className="text-sm font-black text-brand-cyan">{money(exhibitor.totalStandRevenueCents)}</p></div><span className={`text-[10px] font-bold uppercase ${exhibitor.isActive?"text-green-400":"text-red-400"}`}>{exhibitor.isActive?"Ativo":"Inativo"}</span></div></button> }
function Count({icon,value,label}:{icon:ReactNode;value:number;label:string}) { return <div className="flex items-center gap-2"><span className="text-white/30 [&_svg]:h-4 [&_svg]:w-4">{icon}</span><div><p className="text-sm font-black">{value}</p><p className="text-[9px] uppercase tracking-wider text-white/30">{label}</p></div></div> }
const money=(cents:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(cents/100);
const financialLabel=(status:"ADIMPLENTE"|"PENDENTE"|"INADIMPLENTE")=>({ADIMPLENTE:"Adimplente",PENDENTE:"Pendente",INADIMPLENTE:"Inadimplente"})[status];

function Stat({icon,value,label}:{icon:ReactNode;value:number;label:string}) { return <div className="glass-card flex items-center gap-3 rounded-xl border border-white/5 px-4 py-3"><span className="text-brand-cyan [&_svg]:h-4 [&_svg]:w-4">{icon}</span><b>{value}</b><span className="text-xs text-white/40">{label}</span></div> }
function Info({label,value}:{label:string;value:string}) { return <div className="rounded-xl border border-white/10 p-4"><p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p><p className="mt-1 font-semibold">{value}</p></div> }
function Row({title,subtitle,meta}:{title:string;subtitle:string;meta:string}) { return <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3"><div><p className="font-semibold">{title}</p><p className="text-xs text-white/40">{subtitle}</p></div><span className="text-xs text-white/50">{meta}</span></div> }
function Loading(){return <p className="py-10 text-center text-white/40">Carregando...</p>}
function Section({title,children}:{title:string;children:ReactNode}) { return <section><h3 className="mb-3 text-xs font-black uppercase tracking-[.18em] text-white/45">{title}</h3><div className="rounded-2xl border border-white/5 bg-white/3 p-3 sm:p-4">{children}</div></section> }
function Metric({label,value,accent="text-white"}:{label:string;value:string;accent?:string}) { return <div className="rounded-xl border border-white/10 bg-white/3 p-3 sm:p-4"><p className="text-[9px] font-black uppercase tracking-wider text-white/35">{label}</p><p className={`mt-1 truncate text-base font-black sm:text-lg ${accent}`} title={value}>{value}</p></div> }
function Empty({label}:{label:string}) { return <p className="py-6 text-center text-sm text-white/30">{label}</p> }
const date=(value:string|null)=>value?new Intl.DateTimeFormat("pt-BR").format(new Date(value)):"Não informado";
const financialStatusClass=(status:"ADIMPLENTE"|"PENDENTE"|"INADIMPLENTE")=>({ADIMPLENTE:"bg-green-500/15 text-green-400",PENDENTE:"bg-amber-500/15 text-amber-400",INADIMPLENTE:"bg-red-500/15 text-red-400"})[status];
