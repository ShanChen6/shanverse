import assert from "node:assert/strict";
import test from "node:test";

import { applyInput, baseChar, charStates, computeStats, emptyProgress, isComplete, isMistake, normalizeText, pickIndex } from "./logic";
import { CODE_PASSAGES, TEXT_PASSAGES } from "./passages";

/** Types `text` one character at a time, like a user would. */
function typeOut(target: string, text: string) {
  let progress = emptyProgress;
  for (const char of text) progress = applyInput(target, progress, progress.value + char);
  return progress;
}

test("marks characters correct, incorrect or pending", () => {
  assert.deepEqual(charStates("abc", "ax"), ["correct", "incorrect", "pending"]);
});

test("counts typed characters and mistakes as they are typed", () => {
  const progress = typeOut("hello", "hxllo");
  assert.equal(progress.typed, 5);
  assert.equal(progress.errors, 1);
  assert.equal(progress.value, "hxllo");
});

test("fixing a mistake keeps it counted against accuracy", () => {
  let progress = typeOut("abc", "ax");
  progress = applyInput("abc", progress, "a");
  progress = applyInput("abc", progress, "abc");
  assert.equal(progress.errors, 1);
  assert.equal(progress.typed, 4);
  assert.equal(computeStats("abc", progress, 60000).accuracy, 75);
});

test("never accepts more than the target length", () => {
  const progress = applyInput("abc", emptyProgress, "abcdef");
  assert.equal(progress.value, "abc");
  assert.ok(isComplete("abc", progress.value));
});

test("Vietnamese input methods are not punished while composing", () => {
  assert.equal(baseChar("ệ"), "e");
  assert.equal(baseChar("đ"), "d");
  assert.equal(isMistake("e", "ê"), false);
  assert.equal(isMistake("d", "đ"), false);
  assert.equal(isMistake("x", "ê"), true);

  // Telex: "e" then "ee" → "ê", then "s" → "ế".
  let progress = applyInput("ế", emptyProgress, "e");
  progress = applyInput("ế", progress, "ê");
  progress = applyInput("ế", progress, "ế");
  assert.equal(progress.errors, 0);
  assert.deepEqual(charStates("ế", progress.value), ["correct"]);
});

test("decomposed input (NFD) is normalised before comparing", () => {
  const progress = applyInput("ế", emptyProgress, "ế".normalize("NFD"));
  assert.deepEqual(charStates("ế", progress.value), ["correct"]);
});

test("in code, Enter adds the next line's indentation", () => {
  const target = "if (a) {\n  go();\n}";
  const progress = typeOut(target, "if (a) {\n");
  assert.equal(progress.value, "if (a) {\n  ");
  assert.equal(typeOut(target, "if (a) {\ngo();\n}").value, target);
});

test("a wrong Enter does not add indentation", () => {
  const progress = typeOut("ab\n  c", "a\n");
  assert.equal(progress.value, "a\n");
});

test("WPM counts correct characters, five per word", () => {
  const target = "a".repeat(50);
  const progress = typeOut(target, target);
  assert.deepEqual(computeStats(target, progress, 60000), { wpm: 10, rawWpm: 10, accuracy: 100 });
  const half = typeOut(target, "a".repeat(25) + "b".repeat(25));
  assert.equal(computeStats(target, half, 60000).wpm, 5);
  assert.equal(computeStats(target, half, 60000).rawWpm, 10);
});

test("very short times do not produce absurd speeds", () => {
  const progress = typeOut("abcde", "abcde");
  assert.equal(computeStats("abcde", progress, 10).wpm, 60);
});

test("pickIndex avoids repeating the last passage", () => {
  for (let i = 0; i < 20; i++) assert.notEqual(pickIndex(5, 2, () => i / 20), 2);
  assert.equal(pickIndex(1, 0), 0);
});

test("all passages are clean and can be typed through exactly", () => {
  const all = [...TEXT_PASSAGES.vi, ...TEXT_PASSAGES.en, ...CODE_PASSAGES];
  assert.equal(new Set(all.map((p) => p.id)).size, all.length);
  for (const passage of all) {
    const target = normalizeText(passage.text);
    assert.equal(target, passage.text, `${passage.id} should already be normalised`);
    assert.equal(target, target.normalize("NFC"), `${passage.id} should be NFC`);
    assert.ok(!/ \n| $/m.test(target), `${passage.id} has trailing spaces`);
    // Typing it without leading indentation (as a user would) completes it exactly.
    const typedByUser = target.replace(/\n +/g, "\n");
    const progress = typeOut(target, typedByUser);
    assert.equal(progress.value, target, passage.id);
    assert.equal(progress.errors, 0, passage.id);
  }
});
