/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCustomersByUserId } from "@/lib/mock/mock-customers";

export const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@veristable.io",
    password: "admin123",
  },
  {
    id: "2",
    name: "Client User",
    email: "emisor@veristable.io",
    password: "cliente123",
  },
  {
    id: "3",
    name: "Auditor User",
    email: "auditor@veristable.io",
    password: "auditor123",
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
          (u) => u.email === credentials.email && u.password === credentials.password,
        );

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.userId = (user as any).id;
        token.accessToken = "mock-token-" + (user as any).id;
      }

      // Recompute onboarding status on sign-in and on session update (after onboarding form submit)
      if (user || trigger === "update") {
        const userId = token.userId as string;
        const customers = getCustomersByUserId(userId);
        token.onboardingCompleted = customers.length > 0;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.accessToken = token.accessToken as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
