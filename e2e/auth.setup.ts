import { expect, test as setup } from "@playwright/test";

/**
 * Signs each role in once via the better-auth API and captures storage
 * state; specs opt in with test.use({ storageState: ... }). Separate
 * `request` fixtures per setup() keep cookies from cross-contaminating.
 */

setup("authenticate admin", async ({ request }) => {
  const res = await request.post("/api/auth/sign-in/email", {
    data: { email: "admin@e2e.test", password: "e2e-admin-password" },
  });
  expect(res.ok()).toBeTruthy();
  await request.storageState({ path: "e2e/.auth/admin.json" });
});

setup("authenticate user", async ({ request }) => {
  const res = await request.post("/api/auth/sign-in/email", {
    data: { email: "user@e2e.test", password: "e2e-user-password" },
  });
  expect(res.ok()).toBeTruthy();
  await request.storageState({ path: "e2e/.auth/user.json" });
});
