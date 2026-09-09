import * as React from "react";

interface UseTypewriterProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayDuration?: number;
}

export function useTypewriter({
  words,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayDuration = 2000,
}: UseTypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [currentText, setCurrentText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [speed, setSpeed] = React.useState(typingSpeed);

  React.useEffect(() => {
    const handleTyping = () => {
      const fullWord = words[currentWordIndex];

      if (!isDeleting) {
        // Đang gõ chữ vào
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        setSpeed(typingSpeed);

        if (currentText === fullWord) {
          // Gõ xong hết từ thì dừng lại trước khi xóa
          setSpeed(delayDuration);
          setIsDeleting(true);
        }
      } else {
        // Đang xóa chữ đi
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        setSpeed(deletingSpeed);

        if (currentText === "") {
          setIsDeleting(false);
          // Chuyển sang từ tiếp theo
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, speed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, delayDuration, speed]);

  return currentText;
}
