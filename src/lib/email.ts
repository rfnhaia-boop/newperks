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
