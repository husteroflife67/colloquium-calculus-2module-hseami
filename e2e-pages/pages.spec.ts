import { test, expect } from "@playwright/test";
test("production app and PDFs work under GitHub Pages repository path", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Обзор", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".learning-summary")).toContainText("0 / 209");
  const program = page.getByRole("link", {
    name: "Программа курса",
    exact: true,
  });
  await expect(program).toHaveAttribute(
    "href",
    "/colloquium-calculus-2module-hseami/sources/program.pdf",
  );
  for (const file of ["program.pdf", "notes.pdf", "corrected-guide.pdf"]) {
    const response = await request.get("sources/" + file);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
  }
  await page
    .getByRole("button", { name: "Теория и доказательства", exact: true })
    .click();
  await page.locator(".library-card").first().click();
  await page
    .getByRole("button", { name: "Полностью", exact: true })
    .first()
    .click();
  await expect(page.locator(".proof-steps li").first()).toBeVisible();
  await expect(page.locator(".katex-error")).toHaveCount(0);
  expect(errors).toEqual([]);
});
