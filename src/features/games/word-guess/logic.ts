// Pure word-guess rules. No React, no DOM: everything here is unit-tested.
//
// A round shows a question, then opens one hint per wrong guess (or per
// press of the hint button). After the fifth hint, one more wrong guess
// reveals the answer.

export const MAX_HINTS = 5;
/** The question alone, then one guess after each hint. */
export const MAX_GUESSES = MAX_HINTS + 1;

export type Hints = [string, string, string, string, string];

export type WordEntry = {
  /** Prefixed by its source, e.g. "static:closure", later "notion:<page id>". */
  id: string;
  /** Topic id. Topics come from the data, so a new one needs no code change. */
  topic: string;
  question: string;
  hints: Hints;
  /** The answer as shown to the player. */
  answer: string;
  /** Other spellings that also count as correct. */
  accept: string[];
};

export type Round = {
  id: string;
  /** Wrong guesses so far, as typed, oldest first. */
  guesses: string[];
  /** Hints opened so far, 0 to MAX_HINTS. */
  hints: number;
  status: "playing" | "won" | "lost";
};

export type Verdict = "empty" | "correct" | "near" | "repeat" | "wrong";

export type Random = () => number;

/**
 * Lowercase, Vietnamese tones and marks removed (đ becomes d), and only
 * letters and digits kept, so "Next.js", "next js" and "NEXTJS" all match,
 * as do "Hà Nội" and "ha noi".
 */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Fewest single-character insertions, deletions or substitutions from a to b. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    previous = current;
  }
  return previous[b.length];
}

/**
 * How many typos still count as "almost". Short answers get none, since
 * "css" and "csv" are different things.
 */
export function nearLimit(length: number): number {
  if (length <= 4) return 0;
  if (length <= 8) return 1;
  return 2;
}

/** Every accepted spelling of the entry, normalized and without duplicates. */
export function acceptedForms(entry: Pick<WordEntry, "answer" | "accept">): string[] {
  return [...new Set([entry.answer, ...entry.accept].map(normalize).filter(Boolean))];
}

/** Judges a guess on its own, without looking at earlier guesses. */
export function judge(entry: Pick<WordEntry, "answer" | "accept">, text: string): Exclude<Verdict, "repeat"> {
  const guess = normalize(text);
  if (!guess) return "empty";
  const forms = acceptedForms(entry);
  if (forms.includes(guess)) return "correct";
  const near = forms.some((form) => {
    const limit = nearLimit(form.length);
    return limit > 0 && levenshtein(guess, form) <= limit;
  });
  return near ? "near" : "wrong";
}

export function newRound(id: string): Round {
  return { id, guesses: [], hints: 0, status: "playing" };
}

/** A wrong guess or a hint request: open the next hint, or lose after the last one. */
function spendGuess(round: Round, guess?: string): Round {
  const guesses = guess === undefined ? round.guesses : [...round.guesses, guess];
  if (round.hints >= MAX_HINTS) return { ...round, guesses, status: "lost" };
  return { ...round, guesses, hints: round.hints + 1 };
}

/**
 * Plays one typed guess. Empty input, "almost" and a guess already tried
 * cost nothing; a new wrong guess opens the next hint.
 */
export function submitGuess(round: Round, entry: WordEntry, text: string): { round: Round; verdict: Verdict } {
  if (round.status !== "playing") return { round, verdict: "empty" };
  const verdict = judge(entry, text);
  if (verdict === "empty" || verdict === "near") return { round, verdict };
  if (verdict === "correct") return { round: { ...round, status: "won" }, verdict };
  const guess = normalize(text);
  if (round.guesses.some((previous) => normalize(previous) === guess)) return { round, verdict: "repeat" };
  return { round: spendGuess(round, text.trim()), verdict };
}

/** The hint button: costs a guess. Only while there is a hint left to open. */
export function takeHint(round: Round): Round {
  if (round.status !== "playing" || round.hints >= MAX_HINTS) return round;
  return spendGuess(round);
}

export const guessesLeft = (round: Round) => MAX_GUESSES - round.hints;

/** Five stars with no hint, one fewer per hint opened. Zero for a lost round. */
export const stars = (round: Round) => (round.status === "won" ? MAX_HINTS - round.hints : 0);

/** Ids in the chosen topic, or every id for null ("all topics"). */
export function poolIds(entries: readonly WordEntry[], topic: string | null): string[] {
  return entries.filter((entry) => topic === null || entry.topic === topic).map((entry) => entry.id);
}

/**
 * Picks a random word from the topic that has not been played yet. When the
 * topic is used up, its ids are cleared from `played` (other topics keep
 * their progress) and the pick starts over. Returns null only for an empty
 * topic.
 */
export function pickNext(
  entries: readonly WordEntry[],
  topic: string | null,
  played: readonly string[],
  random: Random = Math.random,
): { id: string; played: string[] } | null {
  const pool = poolIds(entries, topic);
  if (!pool.length) return null;
  const seen = new Set(played);
  let fresh = pool.filter((id) => !seen.has(id));
  let nextPlayed = played.slice();
  if (!fresh.length) {
    const inPool = new Set(pool);
    nextPlayed = played.filter((id) => !inPool.has(id));
    fresh = pool;
  }
  return { id: fresh[Math.floor(random() * fresh.length)], played: nextPlayed };
}

/** Words of a text, normalized, so whole-word checks ignore tones and case. */
function words(text: string): string[] {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * True when the text gives the answer away: one of its accepted forms
 * appears as a whole word, or as up to four consecutive words run together
 * ("Stack Overflow"). "GitHub" does not give away "Git".
 */
export function mentionsAnswer(text: string, entry: Pick<WordEntry, "answer" | "accept">): boolean {
  const forms = new Set(acceptedForms(entry));
  const list = words(text);
  for (let start = 0; start < list.length; start++) {
    let joined = "";
    for (let end = start; end < Math.min(list.length, start + 4); end++) {
      joined += list[end];
      if (forms.has(joined)) return true;
    }
  }
  return false;
}

/**
 * Problems with an entry, empty when it is fine. The static word list must
 * have none (a test checks it); entries from Notion with problems are
 * skipped and logged instead of breaking the page.
 */
export function validateEntry(entry: WordEntry): string[] {
  const problems: string[] = [];
  if (!/^[a-z]+:[a-z0-9-]+$/.test(entry.id)) problems.push("id must look like source:slug");
  if (!entry.topic.trim()) problems.push("topic is empty");
  if (!entry.question.trim()) problems.push("question is empty");
  if (!normalize(entry.answer)) problems.push("answer is empty");
  if (entry.hints.length !== MAX_HINTS) problems.push(`needs exactly ${MAX_HINTS} hints`);
  entry.hints.forEach((hint, i) => {
    if (!hint.trim()) problems.push(`hint ${i + 1} is empty`);
    else if (mentionsAnswer(hint, entry)) problems.push(`hint ${i + 1} gives the answer away`);
  });
  if (mentionsAnswer(entry.question, entry)) problems.push("question gives the answer away");
  const forms = [entry.answer, ...entry.accept].map(normalize);
  if (new Set(forms).size !== forms.length) problems.push("accepted spellings repeat after normalizing");
  return problems;
}
