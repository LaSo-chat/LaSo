import NavBar from "@/components/ui/NavBar";
import React, { useState } from "react";

interface FeedbackData {
  rating: number;
  languageTranslation: boolean | null;
  messageSpeed: boolean | null;
  userExperience: boolean | null;
  comment?: string;
}

const FeedbackPage: React.FC = () => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [languageTranslation, setLanguageTranslation] = useState<
    boolean | null
  >(null);
  const [messageSpeed, setMessageSpeed] = useState<boolean | null>(null);
  const [userExperience, setUserExperience] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");

  const emojis = [
    { emoji: "😡", value: 1 },
    { emoji: "😕", value: 2 },
    { emoji: "😐", value: 3 },
    { emoji: "🙂", value: 4 },
    { emoji: "😄", value: 5 },
  ];

  const handleSendFeedback = async () => {
    if (selectedRating === null) {
      alert("Please rate your experience");
      return;
    }

    const feedbackData: FeedbackData = {
      rating: selectedRating,
      languageTranslation,
      messageSpeed,
      userExperience,
      comment: comment.trim() || undefined,
    };

    try {
      const response = await fetch("https://localhost:300", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        throw new Error("Failed to send feedback");
      }

      const result = await response.json();
      console.log("Feedback sent successfully:", result);
      alert("Thank you for your feedback!");
    } catch (error) {
      console.error("Error sending feedback:", error);
      alert("There was a problem sending your feedback. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="fixed top-0 w-full bg-white shadow-md z-10 flex items-center justify-between p-4">
        <h3 className="text-lg ml-2 font-semibold">Give us a Feedback</h3>
      </div>

      <div className="flex-1 mt-16 mb-20 px-4 py-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          {/* Rating Section */}
          <div className="mb-8">
            <p className="text-gray-700 mb-4">
              How would you rate your experience?
            </p>
            <div className="flex justify-between max-w-xs mx-auto">
              {emojis.map(({ emoji, value }) => (
                <button
                  key={value}
                  onClick={() => setSelectedRating(value)}
                  className={`text-3xl transform transition-transform duration-200 ${
                    selectedRating === value ? "scale-150" : "hover:scale-110"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {selectedRating && (
              <p className="text-center text-blue-500 mt-2">
                {selectedRating === 5
                  ? "Excellent"
                  : selectedRating === 4
                    ? "Good"
                    : selectedRating === 3
                      ? "Okay"
                      : selectedRating === 2
                        ? "Poor"
                        : "Very Poor"}
              </p>
            )}
          </div>

          {/* Specific Feedback Section */}
          <div className="mb-8">
            <p className="text-gray-700 mb-4">
              Would you tell us a little more about your experience?
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Language Translation</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLanguageTranslation(true)}
                    className={`p-2 rounded transform transition-transform duration-200 ${languageTranslation === true ? "text-blue-500 scale-150" : "text-gray-400"}`}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => setLanguageTranslation(false)}
                    className={`p-2 rounded transform transition-transform duration-200 ${languageTranslation === false ? "text-red-500 scale-150" : "text-gray-400"}`}
                  >
                    👎
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Message Speed</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMessageSpeed(true)}
                    className={`p-2 rounded transform transition-transform duration-200 ${messageSpeed === true ? "text-blue-500 scale-150" : "text-gray-400"}`}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => setMessageSpeed(false)}
                    className={`p-2 rounded transform transition-transform duration-200 ${messageSpeed === false ? "text-red-500 scale-150" : "text-gray-400"}`}
                  >
                    👎
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-600">User Experience</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setUserExperience(true)}
                    className={`p-2 rounded transform transition-transform duration-200 ${userExperience === true ? "text-blue-500 scale-150" : "text-gray-400"}`}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => setUserExperience(false)}
                    className={`p-2 rounded transform transition-transform duration-200 ${userExperience === false ? "text-red-500 scale-150" : "text-gray-400"}`}
                  >
                    👎
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="mb-8">
            <p className="text-gray-700 mb-2">Comment (optional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your feedback here"
              className="w-full p-3 border rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSendFeedback}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Send Feedback
          </button>
        </div>
      </div>

      <NavBar />
    </div>
  );
};

export default FeedbackPage;
