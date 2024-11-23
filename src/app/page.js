"use client";

import { useDbData, useDbUpdate } from "./utilities/firebase";
import { useEffect, useState } from "react";
import Image from "next/image";


export default function Home() {
  const [pet, error] = useDbData("/kempigotchi");
  const [update, result] = useDbUpdate("/kempigotchi");
  const [hydrated, setHydrated] = useState(false); // To prevent hydration mismatch

  // Ensure hydration by using useEffect
  useEffect(() => {
    setHydrated(true);
  }, []);

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

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-200 to-purple-300 font-sans overflow-hidden flex flex-col">
      {/* Title */}
      <h1 className="w-full text-5xl font-bold text-center text-white drop-shadow-lg mt-6">
        My Kempigotchi
      </h1>

      {/* Stats in Top-Left */}
      <div className="absolute top-8 left-8 text-2xl font-semibold text-white space-y-4 drop-shadow-lg">
        <p>Health: {pet.health}</p>
        <p>Hunger: {pet.energy}</p>
        <p>Happiness: {pet.happiness}</p>
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
