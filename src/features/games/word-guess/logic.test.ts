import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_GUESSES,
  MAX_HINTS,
  guessesLeft,
  judge,
  levenshtein,
  mentionsAnswer,
  nearLimit,
  newRound,
  normalize,
  pickNext,
  poolIds,
  stars,
  submitGuess,
  takeHint,
  validateEntry,
  type Round,
  type WordEntry,
} from "./logic";
import { TOPICS, WORDS } from "./words";

let seed = 11;
const seeded = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const entry = (overrides: Partial<WordEntry> = {}): WordEntry => ({
  id: "static:test",
  topic: "tech",
  question: "Which tool runs containers?",
  hints: ["one", "two", "three", "four", "five"],
  answer: "Kubernetes",
  accept: ["k8s"],
  ...overrides,
});

test("normalize drops case, Vietnamese marks and punctuation", () => {
  assert.equal(normalize("Hà Nội"), "hanoi");
  assert.equal(normalize("ha noi"), "hanoi");
  assert.equal(normalize("Đệ quy"), "dequy");
  assert.equal(normalize("Next.js"), "nextjs");
  assert.equal(normalize("  next-JS "), "nextjs");
  assert.equal(normalize("Cà phê sữa đá"), "caphesuada");
  assert.equal(normalize("   "), "");
});

test("levenshtein counts edits", () => {
  assert.equal(levenshtein("kubernetes", "kubernetes"), 0);
  assert.equal(levenshtein("kubernets", "kubernetes"), 1);
  assert.equal(levenshtein("kitten", "sitting"), 3);
  assert.equal(levenshtein("", "abc"), 3);
});

test("near limit grows with the answer length, and short answers get none", () => {
  assert.equal(nearLimit(3), 0);
  assert.equal(nearLimit(4), 0);
  assert.equal(nearLimit(5), 1);
  assert.equal(nearLimit(8), 1);
  assert.equal(nearLimit(9), 2);
});

test("judge accepts the answer and its other spellings, and spots near misses", () => {
  const word = entry();
  assert.equal(judge(word, "kubernetes"), "correct");
  assert.equal(judge(word, "K8S"), "correct");
  assert.equal(judge(word, "Kubernets"), "near");
  assert.equal(judge(word, "Kubernetis"), "near");
  assert.equal(judge(word, "Docker"), "wrong");
  assert.equal(judge(word, "  "), "empty");
  // Short answers never count as near: CSV is not CSS.
  assert.equal(judge(entry({ answer: "CSS", accept: [] }), "CSV"), "wrong");
  // Vietnamese without tones is correct.
  assert.equal(judge(entry({ answer: "Hà Nội", accept: [] }), "ha noi"), "correct");
});

test("a wrong guess opens the next hint; the sixth wrong guess loses", () => {
  const word = entry();
  let round: Round = newRound(word.id);
  assert.equal(guessesLeft(round), MAX_GUESSES);
  for (let i = 1; i <= MAX_HINTS; i++) {
    const result = submitGuess(round, word, `wrong ${i}`);
    assert.equal(result.verdict, "wrong");
    round = result.round;
    assert.equal(round.hints, i);
    assert.equal(round.status, "playing");
  }
  assert.equal(guessesLeft(round), 1);
  round = submitGuess(round, word, "still wrong").round;
  assert.equal(round.status, "lost");
  assert.equal(round.guesses.length, MAX_GUESSES);
  assert.equal(stars(round), 0);
});

test("empty input, near misses and repeated guesses cost nothing", () => {
  const word = entry();
  let round = newRound(word.id);
  assert.deepEqual(submitGuess(round, word, "   "), { round, verdict: "empty" });
  assert.deepEqual(submitGuess(round, word, "kubernets"), { round, verdict: "near" });
  round = submitGuess(round, word, "Docker").round;
  assert.equal(round.hints, 1);
  const again = submitGuess(round, word, "docker!");
  assert.equal(again.verdict, "repeat");
  assert.equal(again.round, round);
});

test("the hint button costs a guess and stops after the fifth hint", () => {
  let round = newRound("static:test");
  for (let i = 0; i < MAX_HINTS; i++) round = takeHint(round);
  assert.equal(round.hints, MAX_HINTS);
  assert.equal(round.guesses.length, 0, "hints are not stored as guesses");
  assert.equal(takeHint(round), round, "no sixth hint");
  assert.equal(round.status, "playing");
});

test("stars: five with no hint, one fewer per hint", () => {
  const word = entry();
  let round = submitGuess(newRound(word.id), word, "kubernetes").round;
  assert.equal(round.status, "won");
  assert.equal(stars(round), 5);
  round = takeHint(takeHint(newRound(word.id)));
  round = submitGuess(round, word, "k8s").round;
  assert.equal(stars(round), 3);
  // A finished round ignores further guesses.
  assert.equal(submitGuess(round, word, "anything").round, round);
});

test("pickNext never repeats within a topic until it is used up, then starts that topic over", () => {
  const words = [
    entry({ id: "static:a", topic: "tech" }),
    entry({ id: "static:b", topic: "tech" }),
    entry({ id: "static:c", topic: "life" }),
  ];
  let played: string[] = ["static:c"];
  const picked = new Set<string>();
  for (let i = 0; i < 2; i++) {
    const next = pickNext(words, "tech", played, seeded);
    assert.ok(next);
    assert.ok(!picked.has(next.id), "no repeat");
    picked.add(next.id);
    played = [...next.played, next.id];
  }
  assert.deepEqual(picked, new Set(["static:a", "static:b"]));
  const restart = pickNext(words, "tech", played, seeded);
  assert.ok(restart);
  assert.deepEqual(restart.played, ["static:c"], "only the tech topic starts over");
  assert.equal(pickNext(words, "history", [], seeded), null);
  assert.deepEqual(poolIds(words, null), ["static:a", "static:b", "static:c"]);
});

test("pickNext ignores played ids that no longer exist", () => {
  const words = [entry({ id: "static:a" })];
  const next = pickNext(words, null, ["static:gone"], seeded);
  assert.equal(next?.id, "static:a");
});

test("mentionsAnswer works on whole words, so GitHub does not give away Git", () => {
  const git = entry({ answer: "Git", accept: [] });
  assert.equal(mentionsAnswer("Một trang lấy tên nó rồi thêm chữ Hub", git), false);
  assert.equal(mentionsAnswer("Lưu code trên GitHub", git), false);
  assert.equal(mentionsAnswer("Dùng git commit", git), true);
  const so = entry({ answer: "Stack Overflow", accept: [] });
  assert.equal(mentionsAnswer("Gọi sâu quá gây stack overflow", so), true);
  assert.equal(mentionsAnswer("ngăn xếp và tràn", so), false);
});

test("validateEntry catches broken entries", () => {
  assert.deepEqual(validateEntry(entry()), []);
  assert.ok(validateEntry(entry({ id: "test" })).length);
  assert.ok(validateEntry(entry({ hints: ["a", "b", "c", "d", ""] })).length);
  assert.ok(validateEntry(entry({ hints: ["a", "b", "c", "d", "It is Kubernetes"] })).length);
  assert.ok(validateEntry(entry({ accept: ["kube-rnetes"] })).length, "duplicate spelling");
  assert.ok(validateEntry(entry({ hints: ["a", "b", "c", "d"] as unknown as WordEntry["hints"] })).length);
});

test("every built-in word is valid, unique and in a named topic", () => {
  assert.ok(WORDS.length >= 20);
  assert.equal(new Set(WORDS.map((w) => w.id)).size, WORDS.length, "ids are unique");
  for (const word of WORDS) {
    assert.deepEqual(validateEntry(word), [], word.id);
    assert.ok(word.id.startsWith("static:"), `${word.id} comes from the static list`);
    assert.ok(TOPICS[word.topic], `${word.id} has a topic with a display name`);
    assert.equal(judge(word, word.answer), "correct", `${word.id} accepts its own answer`);
  }
  for (const topic of Object.keys(TOPICS)) assert.ok(WORDS.some((w) => w.topic === topic), `${topic} has words`);
});
