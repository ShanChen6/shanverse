import * as React from "react";

type TypewriterOptions = {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayDuration?: number;
};

function subscribeToReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function reducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useTypewriter({
  words,
  typingSpeed = 110,
  deletingSpeed = 55,
  delayDuration = 1800,
}: TypewriterOptions) {
  const firstWord = words[0] ?? "";
  const [wordIndex, setWordIndex] = React.useState(0);
  const [text, setText] = React.useState(firstWord);
  const [deleting, setDeleting] = React.useState(false);
  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeToReducedMotion,
    reducedMotionSnapshot,
    () => false,
  );

  React.useEffect(() => {
    if (prefersReducedMotion || words.length === 0) {
      setText(firstWord);
      setWordIndex(0);
      setDeleting(false);
      return;
    }

    const word = words[wordIndex] ?? firstWord;
    const atEnd = text === word;
    const atStart = text.length === 0;
    const delay = atEnd && !deleting
      ? delayDuration
      : deleting
        ? deletingSpeed
        : typingSpeed;

    const timer = window.setTimeout(() => {
      if (atEnd && !deleting) {
        setDeleting(true);
        return;
      }
      if (atStart && deleting) {
        setDeleting(false);
        setWordIndex((index) => (index + 1) % words.length);
        return;
      }
      setText(
        deleting
          ? word.slice(0, Math.max(0, text.length - 1))
          : word.slice(0, text.length + 1),
      );
    }, delay);

    return () => window.clearTimeout(timer);
  }, [deleting, deletingSpeed, delayDuration, firstWord, prefersReducedMotion, text, typingSpeed, wordIndex, words]);

  return { text, prefersReducedMotion };
}
