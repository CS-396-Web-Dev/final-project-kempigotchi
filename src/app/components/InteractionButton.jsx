import { useState } from "react";

const InteractionButton = ({ label, color, emoji, onClick }) => {
  const [showEmoji, setShowEmoji] = useState(false);

  const handleClick = () => {
    setShowEmoji(true);
    onClick();
    setTimeout(() => setShowEmoji(false), 1000);
  };

  const colorClasses = {
    green:
      "bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:via-green-600 hover:to-green-700",
    purple:
      "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 hover:from-purple-500 hover:via-purple-600 hover:to-purple-700",
    red: "bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:from-red-500 hover:via-red-600 hover:to-red-700",
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* button */}
      <button
        onClick={handleClick}
        className={`flex items-center justify-center w-32 h-32 text-2xl font-bold text-white rounded-full shadow-xl ${colorClasses[color]}`}
      >
        {label}
      </button>

      {/* emoji animation */}
      {showEmoji && (
        <div
          className="absolute -top-12 text-3xl animate-riseAndFade"
          style={{ animation: "riseAndFade 1s ease-out forwards" }}
        >
          {emoji}
        </div>
      )}
    </div>
  );
};

export default InteractionButton;
