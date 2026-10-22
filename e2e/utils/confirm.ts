import type { Page } from "@playwright/test";

/**
 * Confirms the admin's in-page AlertDialog (which replaced
 * window.confirm) by its action button.
 */
export async function confirm(page: Page, action: string) {
  await page.getByRole("alertdialog").getByRole("button", { name: action, exact: true }).click();
}
