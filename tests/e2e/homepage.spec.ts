import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load the homepage and show the main heading", async ({ page }) => {
    // Navigate to the root (default locale usually handles redirect or renders)
    await page.goto("/");

    // Check if the h1 is present
    // Since it's localized, we just check if it's visible and not empty
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).not.toBeEmpty();
  });
});
