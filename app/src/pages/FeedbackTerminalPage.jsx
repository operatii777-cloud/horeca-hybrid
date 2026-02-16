import { useState } from "react";

const EMOJIS = [
  { emoji: "😡", label: "Foarte nemulțumit", value: 1 },
  { emoji: "😕", label: "Nemulțumit", value: 2 },
  { emoji: "😐", label: "Neutru", value: 3 },
  { emoji: "🙂", label: "Mulțumit", value: 4 },
  { emoji: "😍", label: "Foarte mulțumit", value: 5 },
];

export default function FeedbackTerminalPage() {
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  const handleSubmit = () => {
    if (rating === null) return;
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    })
      .then((r) => r.json())
      .then((fb) => {
        setFeedbacks((prev) => [fb, ...prev]);
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setRating(null);
          setComment("");
        }, 3000);
      })
      .catch(() => {});
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🙏</div>
          <div className="text-4xl font-bold text-green-400">Mulțumim!</div>
          <div className="text-xl text-gray-400 mt-2">Feedback-ul dvs. a fost înregistrat</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-2">📝 Cum a fost experiența?</h1>
        <p className="text-gray-400 text-lg mb-8">
          Apăsați pe un emoji pentru a ne oferi feedback
        </p>

        <div className="flex justify-center gap-4 mb-8">
          {EMOJIS.map((e) => (
            <button
              key={e.value}
              onClick={() => setRating(e.value)}
              className={`text-6xl p-4 rounded-xl transition-all ${
                rating === e.value
                  ? "bg-blue-600/30 ring-4 ring-blue-500 scale-110"
                  : "hover:bg-gray-800 hover:scale-105"
              }`}
              title={e.label}
            >
              {e.emoji}
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          placeholder="Comentariu opțional..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 mb-6 text-lg"
        />

        <button
          onClick={handleSubmit}
          disabled={rating === null}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-4 rounded-xl font-bold text-xl"
        >
          Trimite
        </button>
      </div>
    </div>
  );
}
