import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "./prisma";

function gerarSlugUnico(base: string) {
  const limpo =
    base
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "loja";
  return limpo;
}

async function lojistaGoogle(email: string, nome: string) {
  const emailNorm = email.trim().toLowerCase();
  const existente = await prisma.lojista.findUnique({ where: { email: emailNorm } });
  if (existente) return existente;

  const base = gerarSlugUnico(nome || emailNorm.split("@")[0]);
  let slug = base;
  while (await prisma.lojista.findUnique({ where: { slug } })) {
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  // Login via Google não usa senha própria — hash de valor aleatório, nunca comparável.
  const senha = await bcrypt.hash(randomUUID(), 10);

  return prisma.lojista.create({
    data: {
      nome: nome || emailNorm.split("@")[0],
      email: emailNorm,
      senha,
      nomeNegocio: nome || "Meu negócio",
      slug,
    },
  });
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Necessário rodando atrás de proxy reverso (nginx) em produção
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;
        const lojista = await prisma.lojista.findUnique({
          where: { email: (credentials.email as string).trim().toLowerCase() },
        });
        if (!lojista) return null;
        const ok = await bcrypt.compare(credentials.senha as string, lojista.senha);
        if (!ok) return null;
        return { id: lojista.id, email: lojista.email, name: lojista.nome };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && token.email) {
        const lojista = await lojistaGoogle(token.email, token.name ?? "");
        token.id = lojista.id;
        return token;
      }
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
