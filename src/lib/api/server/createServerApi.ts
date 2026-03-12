import { createPrivateApiFactory, createPublicApiFactory } from "../core/createFetchClient";

import { auth } from "@/auth";

async function getServerSessionToken() {
  const session = await auth();
  return session?.accessToken;
}

export const createPrivateServerApi = createPrivateApiFactory(getServerSessionToken);

export const createPublicServerApi = createPublicApiFactory();
