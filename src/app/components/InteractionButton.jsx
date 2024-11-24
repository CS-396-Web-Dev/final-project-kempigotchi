import { useState } from "react";

const InteractionButton = ({ label, color, emoji, onClick }) => {
  const [showEmoji, setShowEmoji] = useState(false);

  const handleClick = () => {
    setShowEmoji(true);
    onClick();
    setTimeout(() => setShowEmoji(false), 1000);
  };

  const colorClasses = {
    blue: "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700",
    yellow: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700",
    green: "bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:via-green-600 hover:to-green-700",
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
