// Shuffle a question list's options (display order only — option IDs and
// correctAnswers are untouched, so scoring is unaffected).
export const shuffleOptions = (questions) =>
  questions.map((q) => {
    const options = [...q.options];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return { ...q, options };
  });
