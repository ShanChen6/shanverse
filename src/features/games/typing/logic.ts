// Pure typing-test maths. No React, no DOM: everything here is unit-tested.
//
// The UI reads the whole value of a hidden textarea on every input event
// instead of individual key presses. That way Vietnamese input methods
// (Telex, VNI), mobile keyboards and autocorrect all work: we only ever
// compare "what is in the box now" with the target text.

export type CharState = "correct" | "incorrect" | "pending";

export type Progress = {
  /** The accepted input, never longer than the target. */
  value: string;
  /** Characters typed in total (only additions count, not deletions). */
  typed: number;
  /** Characters that were wrong at the moment they were typed. */
  errors: number;
};

export const emptyProgress: Progress = { value: "", typed: 0, errors: 0 };

/** Normalises line endings and trims, so passages compare predictably. */
export const normalizeText = (text: string) => text.replace(/\r\n?/g, "\n").replace(/\t/g, "  ").trim();

export function charStates(target: string, value: string): CharState[] {
  return Array.from(target, (char, index) =>
    index >= value.length ? "pending" : value[index] === char ? "correct" : "incorrect",
  );
}

export const correctChars = (target: string, value: string) =>
  charStates(target, value).filter((state) => state === "correct").length;

export const isComplete = (target: string, value: string) => value.length >= target.length;

/** Letter without Vietnamese marks: "ệ" → "e", "đ" → "d". */
export const baseChar = (char: string) =>
  char.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

/**
 * Whether a typed character counts as a mistake. Telex/VNI type "e" before
 * turning it into "ê", so a bare letter matching the target's base letter is
 * a character still being composed, not an error. The final value is still
 * compared exactly, so a wrong mark shows red and lowers the WPM.
 */
export const isMistake = (typed: string, expected: string | undefined) =>
  expected === undefined || (typed !== expected && baseChar(typed) !== baseChar(expected));

/** Leading spaces of the target line that starts at `index`. */
function indentAt(target: string, index: number): string {
  const match = /^ +/.exec(target.slice(index));
  return match ? match[0] : "";
}

/**
 * Accepts a new textarea value. Counts newly typed characters and errors,
 * caps the value at the target length and, in code, adds the next line's
 * indentation after a correct Enter so nobody has to type leading spaces.
 */
export function applyInput(target: string, previous: Progress, next: string): Progress {
  let value = next.normalize("NFC").replace(/\r\n?/g, "\n").slice(0, target.length);

  let typed = previous.typed;
  let errors = previous.errors;
  // Count only characters appended past what was already there and unchanged.
  let common = 0;
  while (common < previous.value.length && common < value.length && previous.value[common] === value[common]) common++;
  for (let i = common; i < value.length; i++) {
    typed++;
    if (isMistake(value[i], target[i])) errors++;
  }

  if (value.length > previous.value.length && value.endsWith("\n") && target[value.length - 1] === "\n") {
    const indent = indentAt(target, value.length);
    if (indent) {
      value = (value + indent).slice(0, target.length);
      typed += indent.length;
    }
  }

  return { value, typed, errors };
}

export type Stats = {
  /** Correct characters per minute divided by 5 (the standard "word"). */
  wpm: number;
  /** All typed characters per minute divided by 5. */
  rawWpm: number;
  /** Share of typed characters that were right when typed, 0–100. */
  accuracy: number;
};

export function computeStats(target: string, progress: Progress, elapsedMs: number): Stats {
  const minutes = Math.max(elapsedMs, 1000) / 60000;
  const correct = correctChars(target, progress.value);
  const accuracy = progress.typed ? Math.max(0, ((progress.typed - progress.errors) / progress.typed) * 100) : 100;
  return {
    wpm: Math.round(correct / 5 / minutes),
    rawWpm: Math.round(progress.value.length / 5 / minutes),
    accuracy: Math.round(accuracy),
  };
}

/** Picks a passage index, avoiding the one just played when possible. */
export function pickIndex(count: number, exclude: number | null, random: () => number = Math.random): number {
  if (count <= 1) return 0;
  const pool = Array.from({ length: count }, (_, i) => i).filter((i) => i !== exclude);
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
