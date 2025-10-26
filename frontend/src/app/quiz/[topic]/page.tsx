"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // ✅ already imported
import { quizzes } from '@/lib/questions';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

type QuizTopic = keyof typeof quizzes;

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const topic = params.topic as QuizTopic;

  if (!quizzes[topic]) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold">Quiz topic not found.</h1>
      </div>
    );
  }

  const questions = quizzes[topic];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerClick = (selectedAnswer: string) => {
    if (isLoading || quizFinished) return;

    setSelectedOption(selectedAnswer);
    setIsLoading(true);

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      handleNextQuestion(correct ? score + 1 : score);
    }, 1000);
  };

  const handleNextQuestion = async (currentScore: number) => {
    const nextQuestion = currentQuestionIndex + 1;
    setSelectedOption(null);
    setIsCorrect(null);
    setIsLoading(false);

    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
    } else {
      setQuizFinished(true);
      setIsLoading(true);

      try {
        const activityType = `Quiz: ${String(topic).charAt(0).toUpperCase() + String(topic).slice(1)}`;
        const activityDetails = `Scored ${currentScore} out of ${questions.length}`;

        const response = await fetch('/api/user/add-points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pointsToAdd: currentScore,
            activityType: activityType,
            activityDetails: activityDetails
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save score');
        }

        // ✅ NEW: Save updated points locally for dashboard instant update
        localStorage.setItem("updatedPoints", data.newTotalPoints);

        // ✅ NEW: Refresh dashboard data in background (optional instant sync)
        router.refresh();

        toast.success(`Quiz Complete! +${currentScore} points added. Total: ${data.newTotalPoints}`);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getButtonClass = (option: string) => {
    if (!selectedOption) return 'bg-gray-800 hover:bg-teal-500 hover:text-black';
    if (option === selectedOption) return isCorrect ? 'bg-green-600' : 'bg-red-600';
    if (option === currentQuestion.correctAnswer) return 'bg-green-600';
    return 'bg-gray-800 opacity-50';
  };

  if (quizFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="bg-[#161B22] border border-gray-700 p-8 rounded-2xl shadow-xl max-w-lg w-full text-center">
          <h1 className="text-4xl font-bold text-teal-400 mb-4">Quiz Complete!</h1>
          <p className="text-2xl mb-8">
            You scored {score} out of {questions.length}
          </p>
          {isLoading && <p>Saving your score...</p>}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-teal-500 text-black font-bold py-3 rounded-lg hover:bg-teal-400 disabled:bg-gray-600"
            disabled={isLoading}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-[#161B22] border border-gray-700 p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold capitalize text-teal-400">
            {topic} Quiz
          </h2>
          <span className="text-xl font-bold text-gray-400">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
        </div>

        <p className="text-xl text-gray-300 mb-8 min-h-[60px]">
          {currentQuestion.question}
        </p>

        <div className="flex flex-col space-y-4">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswerClick(option)}
              disabled={isLoading || selectedOption !== null}
              className={`w-full text-left p-4 rounded-lg border border-gray-700 transition-all duration-300 ${getButtonClass(option)}`}
            >
              {option}
              {selectedOption === option && isCorrect === true && <Check className="inline-block float-right" />}
              {selectedOption === option && isCorrect === false && <X className="inline-block float-right" />}
            </button>
          ))}
        </div>

        <div className="mt-6 text-right font-bold text-teal-400">
          Score: {score}
        </div>
      </div>
    </div>
  );
}
