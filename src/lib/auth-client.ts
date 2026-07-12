import { adminClient, inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
// Type-only on purpose: a value import would drag the server auth config
// (and pg) into the client bundle.
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [adminClient(), usernameClient(), inferAdditionalFields<typeof auth>()],
});
