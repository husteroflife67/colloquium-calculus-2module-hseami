import { describe, expect, it } from "vitest";
import katex from "katex";
import { items, topics } from "./index";

describe("Учебный корпус", () => {
  it("покрывает все 21 вопрос и восемь тем", () => {
    expect(topics.map((t) => t.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (let n = 1; n <= 21; n++) {
      const theorem = items.find((i) => i.id === `theory-${n}`);
      expect(theorem, `Нет вопроса ${n}`).toBeDefined();
      expect(theorem?.program).toContain(n);
      expect(
        theorem?.proof.length,
        `Нет доказательства вопроса ${n}`,
      ).toBeGreaterThan(0);
    }
    for (const topic of topics)
      for (const kind of ["definition", "theory", "practice"])
        expect(
          items.some((i) => i.topic === topic.id && i.kind === kind),
          `${topic.id}/${kind}`,
        ).toBe(true);
  });
  it("содержит уникальные стабильные ID, происхождение и проверку", () => {
    const ids = items.flatMap((i) => [i.id, ...i.questions.map((q) => q.id)]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const i of items) {
      expect(i.source.length).toBeGreaterThan(5);
      expect(i.review_notes.length).toBeGreaterThan(5);
      expect(
        i.program.every((n) => Number.isInteger(n) && n >= 1 && n <= 21),
      ).toBe(true);
      expect(["source", "generated", "external"]).toContain(i.origin);
      expect(["unchecked", "self_reviewed", "needs_review"]).toContain(
        i.review,
      );
      expect(i.statement.length).toBeGreaterThan(15);
      if (i.kind !== "practice")
        expect(
          i.questions.length,
          `Мало уточнений ${i.id}`,
        ).toBeGreaterThanOrEqual(3);
      for (const q of i.questions) {
        expect(q.topic).toBe(i.topic);
        expect(q.program).toEqual(i.program);
        expect(q.origin).toBe("generated");
        expect(q.source.length).toBeGreaterThan(5);
        expect(q.review).toBe("self_reviewed");
        for (const field of [
          "prompt",
          "hint",
          "answer",
          "criteria",
          "mistake",
          "review_notes",
        ] as const)
          expect(q[field].length, `${q.id}.${field}`).toBeGreaterThan(3);
      }
    }
  });
  it("не содержит отсутствующих зависимостей и циклов", () => {
    const byId = new Map(items.map((i) => [i.id, i]));
    const complete = new Set<string>();
    function visit(id: string, path: Set<string>) {
      expect(byId.has(id), `Отсутствует зависимость ${id}`).toBe(true);
      expect(path.has(id), `Цикл через ${id}`).toBe(false);
      if (complete.has(id)) return;
      const next = new Set(path).add(id);
      for (const dependency of byId.get(id)!.dependencies)
        visit(dependency, next);
      complete.add(id);
    }
    for (const i of items) visit(i.id, new Set());
  });
  it("рендерит все формулы KaTeX без синтаксических ошибок", () => {
    for (const item of items) {
      const serialized = JSON.stringify(item);
      // JSON-encoded strings preserve double backslashes; restore actual text first.
      const texts: string[] = [];
      function collect(value: unknown) {
        if (typeof value === "string") texts.push(value);
        else if (Array.isArray(value)) value.forEach(collect);
        else if (value && typeof value === "object")
          Object.values(value).forEach(collect);
      }
      collect(JSON.parse(serialized));
      for (const value of texts)
        for (const match of value.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g))
          expect(
            () =>
              katex.renderToString(match[1] ?? match[2], {
                throwOnError: true,
                strict: "error",
              }),
            `${item.id}: ${match[0]}`,
          ).not.toThrow();
    }
  });
});
