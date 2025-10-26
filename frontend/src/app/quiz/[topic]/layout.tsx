// Yeh layout ensure karega ki quiz page par Header/Footer na dikhe
// Sirf quiz content hi show ho.

export default function QuizLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <section>
        {/* Hum yahan Header component ko call nahi kar rahe hain */}
        {children}
      </section>
    );
  }