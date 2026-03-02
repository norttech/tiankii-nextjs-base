import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export type AppRole = "admin" | "cliente" | "auditor";

export const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@veristable.io",
    password: "admin123",
    role: "admin",
  },
  {
    id: "2",
    name: "Client User",
    email: "emisor@veristable.io",
    password: "cliente123",
    role: "cliente",
  },
  {
    id: "3",
    name: "Auditor User",
    email: "auditor@veristable.io",
    password: "auditor123",
    role: "auditor",
  },
];

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = mockUsers.find(
          (u) =>
            u.email === credentials.email &&
            u.password === credentials.password,
        );

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as AppRole,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.accessToken = "mock-token-" + (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        (session.user as any).role = token.role as AppRole;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
