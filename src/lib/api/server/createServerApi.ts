import { auth } from "@/auth";
import { createPrivateApiFactory, createPublicApiFactory } from "../core/createFetchClient";

async function getServerSessionToken() {
  const session = await auth();
  return session?.accessToken;
}

export const createPrivateServerApi = createPrivateApiFactory(getServerSessionToken);

export const createPublicServerApi = createPublicApiFactory();
