"use client";

import { FormEvent, useState } from "react";

export default function CarteiraAcessoForm({ expirado = false, emailInicial = "" }: { expirado?: boolean; emailInicial?: string }) {
  const [email, setEmail] = useState(emailInicial);
  const [estado, setEstado] = useState<"pronto" | "enviando" | "enviado" | "verificando">("pronto");
  const [erro, setErro] = useState("");
  const [codigo, setCodigo] = useState("");
  const [codigoTeste, setCodigoTeste] = useState("");

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");
    setErro("");
    setCodigoTeste("");
    try {
      const res = await fetch("/api/carteira/acesso", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Não foi possível enviar o acesso.");
      setCodigoTeste(data.codigoTeste ?? "");
      setEstado("enviado");
    } catch (err) {
      setEstado("pronto");
      setErro(err instanceof Error ? err.message : "Tente novamente em alguns instantes.");
    }
  }

  async function verificar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("verificando");
    setErro("");
    try {
      const res = await fetch("/api/carteira/verificar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, codigo }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Não foi possível validar o código.");
      window.location.href = "/carteira";
    } catch (err) {
      setEstado("enviado");
      setErro(err instanceof Error ? err.message : "Tente novamente em alguns instantes.");
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Acesso pessoal</p>
      <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">Sua carteira, em um lugar só.</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-400">Informe o e-mail que usou em qualquer cartão. Enviaremos um código de acesso de uso único para abrir sua carteira.</p>
      {expirado && <p className="mt-5 rounded-2xl bg-amber-500/20 border border-amber-500/30 px-4 py-3 text-sm text-amber-200">Esse link expirou. Peça um novo acesso abaixo.</p>}
      {erro && <p className="mt-5 rounded-2xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-200">{erro}</p>}
      {estado === "enviado" || estado === "verificando" ? (
        <form onSubmit={verificar} className="mt-7 rounded-2xl bg-white/10 border border-white/10 p-5 text-[#fffdf8]"><p className="font-bold">Confira seu e-mail.</p><p className="mt-1 text-sm leading-6 text-zinc-300">Se houver uma conta com esse e-mail, enviamos um código válido por 10 minutos.</p><label className="mt-5 block text-sm font-bold text-zinc-300" htmlFor="codigo-carteira">Código de 6 dígitos</label><input id="codigo-carteira" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-center text-xl font-black tracking-[.5em] text-white outline-none transition focus:border-[#e9ff65]/70" />{codigoTeste && <p className="mt-3 text-xs text-[#e9ff65]">Teste local: {codigoTeste}</p>}<button type="submit" disabled={estado === "verificando"} className="mt-4 w-full rounded-2xl bg-[#e9ff65] px-4 py-3.5 font-bold text-zinc-950 transition hover:bg-[#d5ee46] disabled:cursor-wait disabled:opacity-60">{estado === "verificando" ? "Validando..." : "Abrir minha carteira"}</button><button type="button" onClick={() => { setEstado("pronto"); setCodigo(""); }} className="mt-3 w-full text-center text-xs font-bold text-zinc-400 transition hover:text-white">Usar outro e-mail</button></form>
      ) : (
        <form onSubmit={enviar} className="mt-7 space-y-3"><label className="block text-sm font-bold text-zinc-300" htmlFor="email-carteira">Seu e-mail</label><input id="email-carteira" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none backdrop-blur-md transition focus:border-white/30 focus:bg-white/10 focus:ring-4 focus:ring-white/10 placeholder:text-zinc-600" /><button type="submit" disabled={estado === "enviando"} className="w-full rounded-2xl bg-white px-4 py-3.5 font-bold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-wait disabled:opacity-60">{estado === "enviando" ? "Enviando acesso..." : "Enviar meu acesso"}</button></form>
      )}
      <a href="/descobrir" className="mt-6 block text-center text-sm font-bold text-zinc-400 underline decoration-zinc-600 underline-offset-4 transition hover:text-white">Ainda não tem cartão? Descobrir ofertas perto de mim →</a>
    </section>
  );
}
