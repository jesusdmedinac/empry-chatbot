export function TheMomTest({
  question = ""
} : { question?: string }) {
  return (
    <p>
      Tu pregunta: {question}
    </p>
  );
}