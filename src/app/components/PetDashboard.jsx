"use client";

import { useEffect, useState } from "react";
import { useDbData, useDbUpdate } from "./utilities/firebase";
import InteractionButton from "./components/InteractionButton";
import Image from "next/image";
import { auth, logout } from "./utilities/firebase";

export default function PetDashboard({ user }) {
  const userId = user.uid;
  const petDataPath = `/users/${userId}/petData`;
  const [pet, error] = useDbData(petDataPath);
  const [update, result] = useDbUpdate(petDataPath);
  const [hydrated, setHydrated] = useState(false); // To prevent hydration mismatch
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("My Kempigotchi");
  const [stage, setStage] = useState("egg"); // Initial stage

  const stageImages = {
    egg: "/egg.png",
    baby: "/baby_penguin.png",
    adult: "/penguin.png",
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Initialize pet data if not present
  useEffect(() => {
    if (pet === undefined) return; // Data is still loading
    if (pet === null) {
      // No pet data exists, initialize it
      update({
        energy: 100,
        health: 100,
        happiness: 100,
        stage: "egg",
        title: "My Kempigotchi",
        lastUpdated: Date.now(),
        eggTime: Date.now(),
      });
    } else {
      setTitle(pet.title || "My Kempigotchi");
      setStage(pet.stage || "egg");
    }
  }, [pet, update]);

  // ... (Rest of your pet logic, including automatic deduction, stage progression)

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

  if (!hydrated) return null;
  if (error) return <h1 className="text-red-500">Error: {error.message}</h1>;
  if (pet === undefined) return <h1>Loading...</h1>;

  const MAX_STAT_VALUE = 100;

  const handleFeed = () =>
    update({ energy: Math.min(MAX_STAT_VALUE, pet.energy + 10) });
  const handlePlay = () =>
    update({ happiness: Math.min(MAX_STAT_VALUE, pet.happiness + 10) });
  const handleClean = () =>
    update({ health: Math.min(MAX_STAT_VALUE, pet.health + 10) });

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
      {/* Sign Out Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Sign Out
        </button>
      </div>

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

      {/* ... (Rest of your component including stats, pet image, interaction buttons) */}

      {/* Pet Image */}
      <div className="flex flex-col items-center justify-center flex-grow relative">
        <Image
          src={stageImages[stage]} // Dynamically use the image based on the stage
          alt={`${stage} image`} // Alt text updates with the stage
          width={384} // Equivalent to w-96
          height={384} // Equivalent to h-96
          className="rounded-full shadow-xl drop-shadow-lg"
        />

        <div className="flex justify-center space-x-8 mt-8">
          <InteractionButton
            label="Feed"
            color="blue"
            emoji="🍎"
            onClick={handleFeed}
          />
          <InteractionButton
            label="Play"
            color="yellow"
            emoji="⚽"
            onClick={handlePlay}
          />
          <InteractionButton
            label="Clean"
            color="green"
            emoji="🧼"
            onClick={handleClean}
          />
        </div>
      </div>
    </div>
  );
}
