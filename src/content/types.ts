export type Origin = "source" | "generated" | "external";
export type Review = "unchecked" | "self_reviewed" | "needs_review";
export interface OralQuestion {
  topic: number;
  program: number[];
  source: string;
  origin: Origin;
  review: Review;
  id: string;
  prompt: string;
  difficulty: "базовый" | "средний" | "сложный";
  hint: string;
  answer: string;
  criteria: string;
  mistake: string;
  review_notes: string;
}
export interface Item {
  id: string;
  kind: "definition" | "theory" | "practice";
  topic: number;
  program: number[];
  title: string;
  statement: string;
  source: string;
  origin: Origin;
  review: Review;
  review_notes: string;
  dependencies: string[];
  idea: string;
  proof: string[];
  board: string[];
  mistakes: string[];
  examples: string[];
  questions: OralQuestion[];
  required: boolean;
}
export interface Topic {
  id: number;
  title: string;
  subtitle: string;
}
