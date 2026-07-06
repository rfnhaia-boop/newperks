"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle2, QrCode, Smartphone, Gift, TrendingUp, Users, Shield, HelpCircle, Star, Zap } from "lucide-react";
import CartaoSelos from "./CartaoSelos";
import TiltCard from "./TiltCard";

export default function LandingPageContent() {
  const stagger: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <main className="relative min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50vw] w-[50vw] rounded-full bg-violet-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[-20%] h-[60vw] w-[60vw] rounded-full bg-fuchsia-600/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] h-[40vw] w-[40vw] rounded-full bg-indigo-600/10 blur-[100px] mix-blend-screen" />
      </div>

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" as const }}
        className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/40 backdrop-blur-xl border-b border-white/5"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold shadow-lg shadow-violet-500/20">
              <Star className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">NewPerks</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/login" className="hidden sm:block text-sm font-medium text-zinc-400 transition hover:text-white">
              Acessar Painel
            </a>
            <a href="/registro" className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-zinc-950 transition hover:scale-105 hover:bg-zinc-200">
              Criar Conta Grátis
            </a>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative mx-auto flex max-w-7xl flex-col lg:flex-row items-center justify-between px-6 pt-40 pb-20 lg:pt-52 lg:pb-32 gap-16">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex-1 text-left"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300">
            <Zap className="h-4 w-4 text-violet-400" /> O futuro da fidelização
          </motion.div>
          <motion.h1 variants={fadeInUp} className="mt-8 text-5xl font-extrabold tracking-tight sm:text-7xl leading-[1.1]">
            Cartão fidelidade <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              que dá lucro
            </span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="mt-6 max-w-xl text-lg text-zinc-400 leading-relaxed sm:text-xl">
            Abandone o papel. Atraia clientes, aumente a recorrência e tenha dados precisos em um programa de fidelidade 100% digital, acionado por QR Code.
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row gap-4">
            <a href="/registro" className="group flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 font-bold text-white shadow-xl shadow-violet-500/25 transition-all hover:scale-105 hover:shadow-violet-500/40">
              Começar Agora
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="mt-12 flex items-center gap-4 text-sm text-zinc-500">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-zinc-950 bg-zinc-800" />
              ))}
            </div>
            <p>+500 lojistas já estão usando</p>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          className="flex-1 w-full flex justify-center lg:justify-end perspective-[1000px] z-10"
        >
          <TiltCard className="w-full max-w-sm cursor-pointer">
            <div className="shadow-2xl shadow-violet-500/20 rounded-3xl overflow-hidden border border-white/10 bg-zinc-900">
              <CartaoSelos tema="cafe" nomeNegocio="Café & Prosa" nomeCliente="Passe o mouse por cima!" selos={8} selosParaGanhar={10} recompensa="1 Cappuccino" resgates={3} />
            </div>
          </TiltCard>
        </motion.div>
      </section>

      {/* Como Funciona */}
      <section className="relative py-32 bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Magicamente simples.</h2>
            <p className="mt-4 text-xl text-zinc-400">Nem você, nem seu cliente precisam instalar nada.</p>
          </motion.div>

          <div className="mt-20 grid gap-10 md:grid-cols-3">
            {[
              { icon: QrCode, title: "1. O Cliente Escaneia", desc: "No caixa, o cliente aponta a câmera para o display com o seu QR Code único. O cartão digital abre instantaneamente no navegador dele." },
              { icon: Smartphone, title: "2. Você Carimba", desc: "Você acessa seu painel seguro e adiciona um selo digital na conta do cliente em menos de 3 segundos." },
              { icon: Gift, title: "3. Recompensa na Hora", desc: "Ao completar a cartela, a recompensa é liberada automaticamente. O cliente volta mais feliz e compra mais." }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 50 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="group relative rounded-3xl bg-zinc-950 p-8 border border-white/5 hover:border-violet-500/30 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-500/10"
              >
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10 group-hover:scale-110 transition-transform">
                  <f.icon className="h-8 w-8 text-violet-400" />
                </div>
                <h3 className="text-2xl font-bold">{f.title}</h3>
                <p className="mt-4 text-zinc-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Mockup / Benefícios */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="flex-1"
            >
              <h2 className="text-4xl font-bold tracking-tight">O controle total na palma da sua mão.</h2>
              <p className="mt-6 text-xl text-zinc-400">Acompanhe métricas cruciais de retenção e saiba exatamente quem são seus melhores clientes.</p>
              
              <ul className="mt-10 space-y-6">
                {[
                  { icon: TrendingUp, text: "Aumente o ticket médio em até 30%" },
                  { icon: Users, text: "Construa um banco de dados de clientes valiosos" },
                  { icon: Shield, text: "Fim das fraudes do cartãozinho de papel furado" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-lg font-medium text-zinc-200">{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, rotateY: 30, scale: 0.9 }} whileInView={{ opacity: 1, rotateY: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
              className="flex-1 w-full perspective-[1000px]"
            >
              <TiltCard className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-2xl backdrop-blur-xl">
                <div className="h-8 border-b border-white/10 flex items-center gap-2 px-2 pb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="pt-6 grid grid-cols-2 gap-4 pointer-events-none">
                  <div className="rounded-xl bg-zinc-950 p-6 border border-white/5">
                    <div className="text-sm text-zinc-400">Total de Clientes</div>
                    <div className="mt-2 text-4xl font-bold text-white">1,248</div>
                  </div>
                  <div className="rounded-xl bg-violet-600 p-6 border border-violet-500 shadow-lg shadow-violet-500/20">
                    <div className="text-sm text-violet-200">Selos Carimbados</div>
                    <div className="mt-2 text-4xl font-bold text-white">8,592</div>
                  </div>
                  <div className="col-span-2 rounded-xl bg-zinc-950 p-6 border border-white/5 h-32 flex items-end px-4 gap-2">
                    {[30, 45, 60, 40, 80, 55, 90].map((h, i) => (
                      <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-violet-500/50 rounded-t-sm" />
                    ))}
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight">Planos simples, sem surpresas</h2>
          <p className="mt-4 text-xl text-zinc-400">Comece de graça e escale conforme seu negócio cresce.</p>
          
          <div className="mt-20 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            {/* Free */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border border-white/10 bg-zinc-950 p-10 transition-transform hover:-translate-y-2">
              <h3 className="text-2xl font-bold">Iniciante</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold">Grátis</span>
              </div>
              <p className="mt-4 text-zinc-400">Ideal para negócios pequenos testando a ideia.</p>
              <ul className="mt-8 space-y-4">
                {['Até 100 clientes cadastrados', 'Até 500 selos mensais', 'Painel básico', 'Suporte comunitário'].map((l,i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-300">
                    <CheckCircle2 className="h-5 w-5 text-violet-500" /> {l}
                  </li>
                ))}
              </ul>
              <a href="/registro" className="mt-10 block w-full rounded-xl bg-zinc-800 py-4 text-center font-bold text-white transition hover:bg-zinc-700">Começar Grátis</a>
            </motion.div>
            
            {/* Pro */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="relative rounded-3xl border border-violet-500 bg-zinc-900 p-10 shadow-2xl shadow-violet-500/20 transition-transform hover:-translate-y-2">
              <div className="absolute -top-5 right-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1 text-sm font-bold text-white shadow-lg">Mais Popular</div>
              <h3 className="text-2xl font-bold text-violet-400">Lojista Pro</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold">R$ 49</span><span className="text-zinc-400">/mês</span>
              </div>
              <p className="mt-4 text-zinc-400">Sem limites para lojas que já vendem muito.</p>
              <ul className="mt-8 space-y-4">
                {['Clientes ilimitados', 'Selos e recompensas ilimitados', 'Métricas avançadas', 'Customização completa', 'Suporte WhatsApp'].map((l,i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-200">
                    <CheckCircle2 className="h-5 w-5 text-fuchsia-500" /> {l}
                  </li>
                ))}
              </ul>
              <a href="/registro" className="mt-10 block w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-4 text-center font-bold text-white shadow-lg hover:opacity-90">Assinar Plano Pro</a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "O cliente precisa baixar aplicativo?", a: "Não! Basta apontar a câmera nativa do celular para o QR Code. A cartela digital abre direto no navegador, sem fricção." },
              { q: "E se o cliente perder o link?", a: "O sistema reconhece o aparelho ou o número de celular fornecido (opcional). O progresso nunca é perdido!" },
              { q: "Funciona em qualquer celular?", a: "Sim, qualquer smartphone com câmera, seja iPhone ou Android." },
              { q: "Qual a diferença pro cartão de papel?", a: "Com o digital, você sabe exatamente quantas pessoas voltaram, o ticket médio aumenta e ninguém falsifica carimbos, além de ser ecológico." }
            ].map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-white/5 bg-zinc-900/50 p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer hover:bg-zinc-900 transition-colors">
                <summary className="flex items-center justify-between font-bold text-lg">
                  {faq.q}
                  <span className="transition group-open:rotate-180">
                    <HelpCircle className="h-5 w-5 text-zinc-500" />
                  </span>
                </summary>
                <div className="mt-4 text-zinc-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-violet-600/10 blur-3xl -z-10" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-extrabold sm:text-6xl">Pronto para a revolução digital?</h2>
            <p className="mt-8 text-xl text-zinc-400">Leve 2 minutos para configurar e comece a fidelizar agora mesmo.</p>
            <a href="/registro" className="mt-12 inline-flex items-center gap-2 rounded-full bg-white px-10 py-5 text-xl font-black text-zinc-950 shadow-2xl shadow-white/10 transition-transform hover:scale-110">
              Criar Conta Grátis
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-zinc-950 py-12 text-center relative z-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xl font-bold">
            <Star className="h-5 w-5 text-violet-500" /> NewPerks
          </div>
          <p className="text-sm text-zinc-500">© {new Date().getFullYear()} NewPerks Loyalty. Criado para impulsionar vendas.</p>
        </div>
      </footer>
    </main>
  );
}
