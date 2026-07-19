"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LISTA_TEMAS } from "@/lib/themes";
import CartaoSelos from "@/components/CartaoSelos";
import { 
  Store, MapPin, Map, Paintbrush, Award, 
  Gift, Ticket, MessageCircle, BookOpen, Clock, Check,
  Camera, Globe, Plus, Trash2, Link
} from "lucide-react";

type Config = {
  nomeNegocio: string;
  tema: string;
  selosParaGanhar: number;
  recompensa: string;
  ticketMedio: number;
  whatsapp: string;
  instagram: string;
  site: string;
  linksExtra: { titulo: string, url: string }[];
  regras: string;
  horario: string;
  endereco: string;
  cidade: string;
  beneficioVipOuro: string;
  beneficioVipDiamante: string;
};

export default function ConfigForm({ inicial }: { inicial: Config }) {
  const router = useRouter();
  const [cfg, setCfg] = useState<Config>(inicial);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  async function salvar() {
    setSalvando(true);
    setSalvo(false);
    const res = await fetch("/api/lojista/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    setSalvando(false);
    if (res.ok) {
      setSalvo(true);
      router.refresh();
      setTimeout(() => setSalvo(false), 2500);
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_400px]">
      {/* Coluna Esquerda: Formulários */}
      <div className="space-y-6">
        
        {/* Bloco 1: Identidade */}
        <div className="rounded-[2rem] border border-white/10 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
              <Store className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Identidade do Negócio</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                Nome do Negócio
              </label>
              <input
                type="text"
                value={cfg.nomeNegocio}
                onChange={(e) => setCfg({ ...cfg, nomeNegocio: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none backdrop-blur-md transition focus:border-emerald-500/50 focus:bg-white/10 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
            
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Paintbrush className="h-4 w-4 text-zinc-500" />
                Tema Visual
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {LISTA_TEMAS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCfg({ ...cfg, tema: t.id })}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition backdrop-blur-md bg-gradient-to-br ${t.gradiente} ${
                      cfg.tema === t.id
                        ? "border-white ring-4 ring-white/20 scale-105 shadow-xl shadow-white/10"
                        : "border-transparent opacity-60 hover:opacity-100 hover:scale-[1.02]"
                    }`}
                  >
                    <span className="text-2xl drop-shadow-md">{t.emoji}</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{t.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 2: Regras do Cartão */}
        <div className="rounded-[2rem] border border-white/10 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30">
              <Award className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Regras do Cartão</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="mb-3 flex items-center justify-between text-sm font-medium text-zinc-300">
                <span>Selos para completar o cartão</span>
                <span className="rounded-md bg-orange-500/20 px-2 py-0.5 font-bold text-orange-400">{cfg.selosParaGanhar}</span>
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={cfg.selosParaGanhar}
                onChange={(e) => setCfg({ ...cfg, selosParaGanhar: Number(e.target.value) })}
                className="w-full accent-orange-500"
              />
              <div className="mt-1 flex justify-between text-xs text-zinc-500">
                <span>1</span>
                <span>20</span>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Gift className="h-4 w-4 text-zinc-500" />
                Recompensa Final
              </label>
              <input
                type="text"
                value={cfg.recompensa}
                onChange={(e) => setCfg({ ...cfg, recompensa: e.target.value })}
                placeholder="Ex: 1 açaí grátis, 50% de desconto..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none backdrop-blur-md transition focus:border-orange-500/50 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <BookOpen className="h-4 w-4 text-zinc-500" />
                Regras do programa
              </label>
              <textarea
                value={cfg.regras}
                onChange={(e) => setCfg({ ...cfg, regras: e.target.value })}
                rows={4}
                maxLength={600}
                placeholder={"Uma regra por linha. Ex:\nVálido de segunda a sexta\n1 selo por compra acima de R$ 20"}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none backdrop-blur-md transition focus:border-orange-500/50 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10"
              />
              <p className="mt-1.5 text-xs text-zinc-500">
                Cada linha vira um item na aba Benefícios do cartão. Vazio usa as regras padrão.
              </p>
            </div>
            
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Ticket className="h-4 w-4 text-zinc-500" />
                Ticket Médio por compra (R$)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={cfg.ticketMedio || ""}
                onChange={(e) => setCfg({ ...cfg, ticketMedio: Number(e.target.value) })}
                placeholder="Ex: 25.00"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none backdrop-blur-md transition focus:border-orange-500/50 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10"
              />
              <p className="mt-1.5 text-xs text-zinc-500">
                Usado pra estimar seu faturamento no painel (carimbos × ticket médio).
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[.06] p-4">
              <p className="text-sm font-bold text-cyan-100">Benefícios VIP</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">Ouro é liberado com 15 carimbos ou 1 resgate. Diamante, com 30 carimbos ou 3 resgates.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-amber-300">Ouro</label><input type="text" value={cfg.beneficioVipOuro} onChange={(e) => setCfg({ ...cfg, beneficioVipOuro: e.target.value })} maxLength={160} placeholder="Ex: prioridade no agendamento" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none transition focus:border-amber-400/60" /></div>
                <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-cyan-200">Diamante</label><input type="text" value={cfg.beneficioVipDiamante} onChange={(e) => setCfg({ ...cfg, beneficioVipDiamante: e.target.value })} maxLength={160} placeholder="Ex: brinde exclusivo mensal" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 3: Contato e Redes Sociais */}
        <div className="rounded-[2rem] border border-white/10 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Contato e Redes Sociais</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <MessageCircle className="h-4 w-4 text-zinc-500" />
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={cfg.whatsapp}
                  onChange={(e) => setCfg({ ...cfg, whatsapp: e.target.value })}
                  placeholder="Ex: 11 91234-5678"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none backdrop-blur-md transition focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
              
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Camera className="h-4 w-4 text-zinc-500" />
                  Instagram
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">@</span>
                  <input
                    type="text"
                    value={cfg.instagram}
                    onChange={(e) => setCfg({ ...cfg, instagram: e.target.value })}
                    placeholder="seunegocio"
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-3 text-white outline-none backdrop-blur-md transition focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Globe className="h-4 w-4 text-zinc-500" />
                  Site ou Link da Bio
                </label>
                <input
                  type="url"
                  value={cfg.site}
                  onChange={(e) => setCfg({ ...cfg, site: e.target.value })}
                  placeholder="Ex: https://seusite.com.br"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none backdrop-blur-md transition focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Map className="h-4 w-4 text-zinc-500" />
                  Cidade
                </label>
                <input
                  type="text"
                  value={cfg.cidade}
                  onChange={(e) => setCfg({ ...cfg, cidade: e.target.value })}
                  maxLength={80}
                  placeholder="Ex: Jundiaí"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none backdrop-blur-md transition focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Links Extras Dinâmicos */}
            <div className="space-y-4 pt-2 border-t border-white/5">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Link className="h-4 w-4 text-zinc-500" />
                Links Extras (Cardápio, Agendamento, etc)
              </label>
              {cfg.linksExtra?.map((link, index) => (
                <div key={index} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={link.titulo}
                    onChange={(e) => {
                      const newLinks = [...cfg.linksExtra];
                      newLinks[index].titulo = e.target.value;
                      setCfg({ ...cfg, linksExtra: newLinks });
                    }}
                    placeholder="Título (ex: Cardápio)"
                    className="w-full sm:w-1/3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none backdrop-blur-md transition focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...cfg.linksExtra];
                      newLinks[index].url = e.target.value;
                      setCfg({ ...cfg, linksExtra: newLinks });
                    }}
                    placeholder="https://..."
                    className="w-full sm:flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none backdrop-blur-md transition focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newLinks = cfg.linksExtra.filter((_, i) => i !== index);
                      setCfg({ ...cfg, linksExtra: newLinks });
                    }}
                    className="flex h-12 w-full sm:w-12 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCfg({ ...cfg, linksExtra: [...(cfg.linksExtra || []), { titulo: "", url: "" }] })}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                Adicionar mais um link
              </button>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Clock className="h-4 w-4 text-zinc-500" />
                Horário de Atendimento
              </label>
              <input
                type="text"
                value={cfg.horario}
                onChange={(e) => setCfg({ ...cfg, horario: e.target.value })}
                maxLength={120}
                placeholder="Ex: Segunda a Sábado, das 9h às 19h"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none backdrop-blur-md transition focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                📍 Endereço Completo
              </label>
              <input
                type="text"
                value={cfg.endereco}
                onChange={(e) => setCfg({ ...cfg, endereco: e.target.value })}
                maxLength={200}
                placeholder="Ex: Rua das Flores, 123 — Centro"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none backdrop-blur-md transition focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
              />
              <p className="mt-1.5 text-xs text-zinc-500">
                Estes dados aparecem na aba &quot;Sobre nós&quot; no cartão do cliente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Sticky Preview & Botão Salvar */}
      <div className="lg:sticky lg:top-28 space-y-6">
        
        {/* Bloco de Salvamento */}
        <div className="rounded-[2rem] border border-white/10 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl flex flex-col items-center gap-4 text-center">
          <div>
            <h3 className="font-bold text-white">Pronto para salvar?</h3>
            <p className="text-xs text-zinc-400 mt-1">As alterações se aplicam instantaneamente.</p>
          </div>
          
          <button
            onClick={salvar}
            disabled={salvando}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:shadow-emerald-500/40 disabled:scale-100 disabled:opacity-50"
          >
            {salvo ? <Check className="h-5 w-5" /> : <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />}
            <span className="relative z-10">{salvando ? "Salvando..." : salvo ? "Salvo com sucesso!" : "Salvar Alterações"}</span>
          </button>
        </div>

        {/* Prévia ao vivo */}
        <div className="rounded-[2rem] border border-white/10 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-xl hidden md:block">
          <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Prévia do Cartão
          </p>
          <div className="flex justify-center">
            <div className="w-[340px] origin-top scale-[0.85] sm:scale-100 transition-transform">
              <CartaoSelos
                tema={cfg.tema}
                nomeNegocio={cfg.nomeNegocio || "Seu Negócio"}
                selos={Math.min(3, cfg.selosParaGanhar)}
                selosParaGanhar={cfg.selosParaGanhar}
                recompensa={cfg.recompensa || "Sua recompensa"}
                nomeCliente="Cliente exemplo"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
