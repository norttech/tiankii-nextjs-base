import type { Session } from "next-auth";

export type SessionUser = NonNullable<Session["user"]> & {
  // Extended fields for the API context
  isAdmin: boolean;
  isAuditor: boolean;
  isCliente: boolean;
};
