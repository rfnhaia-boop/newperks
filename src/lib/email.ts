import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "NewPerks <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

// Campos digitados por usuários entram no HTML do email — escapar sempre
function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Envia o link de acesso pessoal do cartão para o cliente.
 * Se RESEND_API_KEY não estiver configurada, apenas registra no log
 * (o link também é mostrado na tela). Pronto pra ativar email real.
 */
export async function enviarEmailReset(opts: {
  para: string;
  nome: string;
  link: string;
}): Promise<{ enviado: boolean }> {
  const { para, nome, link } = opts;

  if (!resend) {
    console.log(`[email:simulado] reset -> ${para} | ${link}`);
    return { enviado: false };
  }

  try {
    await resend.emails.send({
      from,
      to: para,
      subject: "Redefinir senha — NewPerks",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0a0a0a;color:#fff;border-radius:16px">
          <h1 style="color:#a78bfa;margin:0 0 8px">NewPerks</h1>
          <p style="color:#d4d4d8">Olá, ${esc(nome)}! Recebemos um pedido pra redefinir sua senha.</p>
          <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">Redefinir senha</a>
          <p style="color:#71717a;font-size:13px">O link expira em 1 hora. Se não foi você, ignore este email.</p>
        </div>
      `,
    });
    return { enviado: true };
  } catch (e) {
    console.error("[email] falha ao enviar reset:", e);
    return { enviado: false };
  }
}

export async function enviarLinkCartao(opts: {
  para: string;
  nomeCliente: string;
  nomeNegocio: string;
  link: string;
  recompensa: string;
}): Promise<{ enviado: boolean }> {
  const { para, nomeCliente, nomeNegocio, link, recompensa } = opts;

  if (!resend) {
    console.log(`[email:simulado] -> ${para} | ${nomeNegocio} | ${link}`);
    return { enviado: false };
  }

  try {
    await resend.emails.send({
      from,
      to: para,
      subject: `Seu cartão fidelidade — ${nomeNegocio}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0a0a0a;color:#fff;border-radius:16px">
          <h1 style="color:#a78bfa;margin:0 0 8px">${esc(nomeNegocio)}</h1>
          <p style="color:#d4d4d8">Olá, ${esc(nomeCliente)}! 👋</p>
          <p style="color:#d4d4d8">Seu cartão fidelidade digital está pronto. A cada compra você junta um selo e ganha: <strong style="color:#fff">${esc(recompensa)}</strong>.</p>
          <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">Ver meu cartão</a>
          <p style="color:#71717a;font-size:13px">Guarde este email — é o seu acesso único ao cartão.</p>
        </div>
      `,
    });
    return { enviado: true };
  } catch (e) {
    console.error("[email] falha ao enviar:", e);
    return { enviado: false };
  }
}

export async function enviarLinkCarteira(opts: { para: string; nome: string; link: string }): Promise<{ enviado: boolean }> {
  const { para, nome, link } = opts;
  if (!resend) {
    console.log(`[email:simulado] carteira -> ${para} | ${link}`);
    return { enviado: false };
  }
  try {
    await resend.emails.send({
      from, to: para, subject: "Acesse sua carteira — NewPerks",
      html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#18181b;color:#fff;border-radius:16px"><p style="color:#a1a1aa;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">NewPerks</p><h1 style="margin:0 0 12px;font-size:26px">Olá, ${esc(nome)}!</h1><p style="color:#d4d4d8;line-height:1.6">Use o botão abaixo para ver todos os seus cartões de fidelidade em um só lugar.</p><a href="${esc(link)}" style="display:inline-block;margin:16px 0;padding:13px 22px;background:#e9ff65;color:#18181b;text-decoration:none;border-radius:10px;font-weight:700">Abrir minha carteira</a><p style="color:#71717a;font-size:13px">Por segurança, este link expira em 15 minutos. Se não foi você, ignore este email.</p></div>`,
    });
    return { enviado: true };
  } catch (e) {
    console.error("[email] falha ao enviar carteira:", e);
    return { enviado: false };
  }
}

export async function enviarCodigoCarteira(opts: { para: string; nome: string; codigo: string }): Promise<{ enviado: boolean }> {
  const { para, nome, codigo } = opts;
  if (!resend) {
    console.log(`[email:simulado] código de carteira para ${para}: ${codigo}`);
    return { enviado: false };
  }
  try {
    await resend.emails.send({
      from, to: para, subject: "Seu código de acesso — NewPerks",
      html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#18181b;color:#fff;border-radius:16px"><p style="color:#a1a1aa;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">NewPerks</p><h1 style="margin:0 0 12px;font-size:26px">Olá, ${esc(nome)}!</h1><p style="color:#d4d4d8;line-height:1.6">Use este código para abrir sua carteira:</p><p style="margin:20px 0;padding:16px;border-radius:12px;background:#27272a;color:#e9ff65;font-size:30px;font-weight:800;letter-spacing:8px;text-align:center">${esc(codigo)}</p><p style="color:#71717a;font-size:13px">Ele expira em 10 minutos e só pode ser usado uma vez. Se não foi você, ignore este email.</p></div>`,
    });
    return { enviado: true };
  } catch (e) {
    console.error("[email] falha ao enviar código da carteira:", e);
    return { enviado: false };
  }
}

export async function enviarEmailAutomacao(opts: { para: string; nome: string; negocio: string; assunto: string; mensagem: string }): Promise<{ enviado: boolean }> {
  const { para, nome, negocio, assunto, mensagem } = opts;
  if (!resend) {
    console.log(`[email:simulado] automação -> ${para} | ${assunto}`);
    return { enviado: false };
  }
  try {
    await resend.emails.send({
      from, to: para, subject: assunto,
      html: `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:28px;background:#18181b;color:#fff;border-radius:18px"><p style="margin:0 0 8px;color:#e9ff65;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase">${esc(negocio)}</p><h1 style="margin:0 0 16px;font-size:26px">Olá, ${esc(nome)}!</h1><p style="margin:0;color:#d4d4d8;line-height:1.7;white-space:pre-line">${esc(mensagem)}</p><a href="${esc(process.env.NEXTAUTH_URL || "http://localhost:3001")}/carteira" style="display:inline-block;margin:22px 0 8px;padding:13px 20px;background:#e9ff65;color:#18181b;text-decoration:none;border-radius:11px;font-weight:800">Abrir meus cartões</a><p style="margin:14px 0 0;color:#71717a;font-size:12px;line-height:1.5">Você recebeu este aviso porque autorizou comunicações do programa de fidelidade.</p></div>`,
    });
    return { enviado: true };
  } catch (e) {
    console.error("[email] falha ao enviar automação:", e);
    return { enviado: false };
  }
}
