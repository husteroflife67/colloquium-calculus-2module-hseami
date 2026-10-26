import { numbers } from "./numbers";
import { sequences } from "./sequences";
import { functions } from "./functions";
import { practice } from "./practice";
import { extraQuestions } from "./extra-questions";
import { guideReferences, guideSupplements, guideQuestions } from "./guide";
import type { Topic, Item } from "./types";
export const items: Item[] = [
  ...numbers,
  ...sequences,
  ...functions,
  ...practice,
].map((item) => ({
  ...item,
  references: [
    ...new Map(
      item.program
        .flatMap((n) => guideReferences[n] ?? [])
        .map((ref) => [ref.id, ref]),
    ).values(),
  ],
  supplements: guideSupplements[item.id] ?? [],
  questions: [
    ...item.questions,
    ...guideQuestions
      .filter((q) => q.target === item.id)
      .map(({ target: _target, ...q }) => q),
    ...extraQuestions
      .filter((q) => q.target === item.id)
      .map(({ target: _target, ...q }) => ({
        ...q,
        topic: item.topic,
        program: item.program,
        source: `Авторское уточнение по источнику: ${item.source}`,
        origin: "generated" as const,
        review: "self_reviewed" as const,
      })),
  ],
}));
export const topics: Topic[] = [
  { id: 1, title: "Вещественные числа", subtitle: "Полнота · точные грани" },
  {
    id: 2,
    title: "Предел последовательности",
    subtitle: "Определение · свойства · неравенства",
  },
  {
    id: 3,
    title: "Существование предела",
    subtitle: "Вейерштрасс · число e · отрезки",
  },
  {
    id: 4,
    title: "Подпоследовательности",
    subtitle: "Частичные · верхний и нижний пределы",
  },
  {
    id: 5,
    title: "Критерий Коши",
    subtitle: "Фундаментальность · вычисление √2",
  },
  {
    id: 6,
    title: "Числовые ряды",
    subtitle: "Сходимость · сравнение · перестановки",
  },
  {
    id: 7,
    title: "Предел функции",
    subtitle: "Коши и Гейне · свойства · композиция",
  },
  {
    id: 8,
    title: "Замечательные пределы",
    subtitle: "Односторонние пределы · монотонность",
  },
];
