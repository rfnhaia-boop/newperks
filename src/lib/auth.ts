import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Necessário rodando atrás de proxy reverso (nginx) em produção
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;
        const lojista = await prisma.lojista.findUnique({
          where: { email: credentials.email as string },
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
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
