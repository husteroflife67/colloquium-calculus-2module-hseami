import { test, expect } from "@playwright/test";
test("card, draft, independent question rating and reload persistence", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Определения", exact: true })
    .first()
    .click();
  await page.locator(".library-card").first().click();
  await page
    .getByRole("button", { name: "Открыть карточку", exact: true })
    .click();
  await page
    .getByPlaceholder("Попробуйте воспроизвести ответ без подсказок…")
    .fill("Мой сохранённый ответ");
  await page
    .locator(".reading > .ratings")
    .getByRole("button", { name: "Знаю", exact: true })
    .click();
  await page.reload();
  await page
    .getByRole("button", { name: "Определения", exact: true })
    .first()
    .click();
  await expect(page.locator(".tiny-status").first()).toHaveText("Знаю");
  await page.locator(".library-card").first().click();
  await page
    .getByRole("button", { name: "Открыть карточку", exact: true })
    .click();
  await expect(page.locator("textarea")).toHaveValue("Мой сохранённый ответ");
});
test("full ticket stages, extra threshold and irreversible choice, history replay", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Пробный коллоквиум", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Начать тренировку", exact: true })
    .click();
  await expect(page.locator(".sim-item")).toHaveCount(2);
  await page.reload();
  await page
    .getByRole("button", { name: "Пробный коллоквиум", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Подготовка", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Вызов на определения", exact: true })
    .click();
  await expect(page.locator(".sim-item")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Определения сданы", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ко второму принимающему", exact: true })
    .click();
  await expect(page.locator(".sim-item")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Короткое утверждение сдано", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Завершить базовый ответ", exact: true })
    .click();
  const scores = page.locator(".score-grid select");
  for (let i = 0; i < 7; i++)
    await scores.nth(i).selectOption(String([0.5, 0.5, 0.5, 0.5, 1, 1, 2][i]));
  await expect(
    page.getByRole("button", { name: "Взять допзадачу на 2", exact: true }),
  ).toHaveCount(0);
  await scores.nth(5).selectOption("1.5");
  await expect(
    page.getByRole("button", { name: "Взять допзадачу на 2", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Взять допзадачу на 2", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Перейти к сдаче", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Завершить сдачу", exact: true })
    .click();
  await expect(scores.first()).toBeDisabled();
  await page
    .getByRole("button", { name: "Сохранить результат", exact: true })
    .click();
  await page.getByRole("button", { name: "История", exact: true }).click();
  await expect(page.locator(".history-card")).toHaveCount(1);
  await expect(page.locator(".history-card")).toContainText("6.5 / 8");
  await page
    .getByRole("button", { name: "Повторить состав", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Начать тренировку", exact: true })
    .click();
  await expect(page.locator(".sim-item")).toHaveCount(2);
});
test("export import validation and reset cancellation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Настройки", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Экспорт JSON", exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  await page.getByLabel("Импорт JSON", { exact: true }).setInputFiles(path!);
  await expect(page.getByRole("status")).toContainText("Данные проверены");
  await page.getByLabel("Импорт JSON", { exact: true }).setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schemaVersion":99}'),
  });
  await expect(page.getByRole("status")).toContainText("не соответствует");
  page.once("dialog", (d) => d.dismiss());
  await page
    .getByRole("button", { name: "Сбросить прогресс", exact: true })
    .click();
  await expect(page.getByRole("status")).not.toContainText("сброшен");
});
test("exam automatic call, shared30 minute limit and second40 minute limit", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page
    .getByRole("button", { name: "Пробный коллоквиум", exact: true })
    .click();
  await page.getByLabel("Режим", { exact: true }).selectOption("exam");
  await page
    .getByRole("button", { name: "Начать тренировку", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Пауза", exact: true }),
  ).toHaveCount(0);
  await page.clock.fastForward(1500_000);
  await expect(
    page.getByRole("heading", { name: "Устные определения", exact: true }),
  ).toBeVisible();
  await page.clock.fastForward(300_000);
  await page.clock.runFor(1000);
  await expect(
    page.getByRole("heading", { name: "Второй принимающий", exact: true }),
  ).toBeVisible();
  await page.clock.fastForward(2400_000);
  await expect(
    page.getByRole("heading", { name: "Самооценка", exact: true }),
  ).toBeVisible();
});
test("mobile reading and dark theme fit viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Меню", exact: true }).click();
  await page.getByRole("button", { name: "Тёмная тема", exact: true }).click();
  await page
    .getByRole("button", { name: "Теория и доказательства", exact: true })
    .click();
  await page.locator(".library-card").first().click();
  await page
    .getByRole("button", { name: "Полностью", exact: true })
    .first()
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".katex-error")).toHaveCount(0);
});
test("new oral question exposes hint answer criteria mistake and persists separate rating", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Вопросы принимающего", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Поиск вопроса", exact: true })
    .fill("отрицание условия Коши");
  const card = page.locator(".question");
  await expect(card).toHaveCount(1);
  await card.getByRole("button", { name: "Подсказка", exact: true }).click();
  await expect(card.locator(".hint")).toContainText("фиксированная точность");
  await card
    .getByRole("button", { name: "Открыть ответ", exact: true })
    .click();
  await expect(card).toContainText("существует ε₀>0");
  await expect(card).toContainText("Достаточно сказать:");
  await expect(card).toContainText("Типичная ошибка:");
  await card.getByRole("button", { name: "Знаю", exact: true }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Вопросы принимающего", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Поиск вопроса", exact: true })
    .fill("отрицание условия Коши");
  await card
    .getByRole("button", { name: "Открыть ответ", exact: true })
    .click();
  await expect(
    card.getByRole("button", { name: "Знаю", exact: true }),
  ).toHaveClass("active");
  await page.getByRole("button", { name: "Обзор", exact: true }).click();
  await expect(page.locator(".learning-summary")).toContainText("1 / 207");
});
