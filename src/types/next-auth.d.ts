import { type DefaultSession } from "next-auth";
import type { AppRole } from "@/auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      role: AppRole;
    } & DefaultSession["user"];
    accessToken?: string;
  }
}
