"use client";

import { useDbData, useDbUpdate } from "./utilities/firebase";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [pet, error] = useDbData("/kempigotchi");
  const [update, result] = useDbUpdate("/kempigotchi");
  const [hydrated, setHydrated] = useState(false); // To prevent hydration mismatch
  const [editingTitle, setEditingTitle] = useState(false); // Track if title is being edited
  const [title, setTitle] = useState("My Kempigotchi"); // Local state for the title

  // Ensure hydration by using useEffect
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Fetch the title from the database if available
  useEffect(() => {
    if (pet?.title) {
      setTitle(pet.title);
    }
  }, [pet]);

  // Automatic deduction of stats
  useEffect(() => {
    if (pet && pet.lastUpdated) {
      const interval = setInterval(() => {
        const now = Date.now();
        const lastUpdated = new Date(pet.lastUpdated).getTime();
        const elapsedSeconds = Math.floor((now - lastUpdated) / 1000);

        const decreaseRate = 5; // Decrease every 5 seconds
        const decreaseAmount = Math.floor(elapsedSeconds / decreaseRate);

        if (decreaseAmount > 0) {
          const newHealth = Math.max(0, pet.health - decreaseAmount);
          const newEnergy = Math.max(0, pet.energy - decreaseAmount);
          const newHappiness = Math.max(0, pet.happiness - decreaseAmount);

          update({
            health: newHealth,
            energy: newEnergy,
            happiness: newHappiness,
            lastUpdated: now,
          });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [pet, update]);

  if (!hydrated) return null; // Prevent rendering until hydration
  if (error) return <h1 className="text-red-500">Error: {error.message}</h1>;
  if (pet === undefined) return <h1>Loading...</h1>;
  if (!pet) return <h1>No pet found.</h1>;

  const MAX_STAT_VALUE = 100;

  const handleFeed = () => update({ energy: Math.min(MAX_STAT_VALUE, pet.energy + 10) });
  const handlePlay = () => update({ happiness: Math.min(MAX_STAT_VALUE, pet.happiness + 10) });
  const handleClean = () => update({ health: Math.min(MAX_STAT_VALUE, pet.health + 10) });

  const handleTitleClick = () => {
    setEditingTitle(true);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleTitleSave = () => {
    setEditingTitle(false);
    update({ title }); // Save the title to Firebase
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleTitleSave();
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-200 to-purple-300 font-sans overflow-hidden flex flex-col">
      {/* Title */}
      <div className="mt-6 w-full text-center">
        {editingTitle ? (
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleSave}
            onKeyDown={handleKeyDown}
            className="text-5xl font-bold text-center text-white bg-transparent border-b-2 border-white focus:outline-none focus:border-blue-500"
          />
        ) : (
          <h1
            onClick={handleTitleClick}
            className="text-5xl font-bold text-center text-white drop-shadow-lg cursor-pointer"
            title="Click to edit title"
          >
            {title}
          </h1>
        )}
      </div>

      {/* Stats in Top-Left */}
      <div className="absolute top-8 left-8 text-xl font-semibold text-white space-y-4 drop-shadow-lg">
        <div className="flex items-center space-x-2">
          <span>Health:</span>
          <div className="w-48 bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{ width: `${(pet.health / MAX_STAT_VALUE) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span>Energy:</span>
          <div className="w-48 bg-gray-200 rounded-full h-4">
            <div
              className="bg-purple-500 h-4 rounded-full"
              style={{ width: `${(pet.energy / MAX_STAT_VALUE) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Happiness on right corner */}
      <div className="absolute top-8 right-8 flex items-center space-x-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index}>
            {index < Math.round((pet.happiness / MAX_STAT_VALUE) * 5) ? (
              // Filled Hearts
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                className="w-10 h-10 text-red-500"
              >
                {/* Heart SVG path create by ChatGPT */}
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            ) : (
              // Empty Hearts
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-10 h-10 text-red-500"
              >
                {/* Heart SVG path create by ChatGPT */}
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            )}
          </span>
        ))}
      </div>


      {/* Pet Image */}
      <div className="flex flex-col items-center justify-center flex-grow">
        <Image
          src="/penguin.png"
          alt="Pet"
          width={384} // Equivalent to w-96
          height={384} // Equivalent to h-96
          className="rounded-full shadow-xl drop-shadow-lg"
        />

        {/* Interaction Buttons */}
        <div className="flex justify-center space-x-8 mt-8">
          <button
            onClick={handleFeed}
            className="flex items-center justify-center w-32 h-32 text-2xl font-bold text-white bg-blue-500 rounded-full shadow-xl hover:bg-blue-600"
          >
            Feed
          </button>
          <button
            onClick={handlePlay}
            className="flex items-center justify-center w-32 h-32 text-2xl font-bold text-white bg-yellow-500 rounded-full shadow-xl hover:bg-yellow-600"
          >
            Play
          </button>
          <button
            onClick={handleClean}
            className="flex items-center justify-center w-32 h-32 text-2xl font-bold text-white bg-green-500 rounded-full shadow-xl hover:bg-green-600"
          >
            Clean
          </button>
        </div>
      </div>
    </div>
  );
}
