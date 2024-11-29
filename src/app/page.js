"use client";

import { useEffect, useState } from "react";
import { useDbData, useDbUpdate, auth, signInWithGoogle, logout } from "./utilities/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import InteractionButton from "./components/InteractionButton";

export default function Home() {
  const [user, setUser] = useState(null); // User state
  const [hydrated, setHydrated] = useState(false); // To prevent hydration mismatch

  const [petDataPath, setPetDataPath] = useState(null);
  const [pet, error] = useDbData(petDataPath);
  const [update, result] = useDbUpdate(petDataPath);

  const [editingTitle, setEditingTitle] = useState(false); // Track if title is being edited
  const [title, setTitle] = useState("My Kempigotchi"); // Local state for the title
  const [stage, setStage] = useState("egg"); // Initial stage

  const stageImages = {
    egg: "/egg.png",
    baby: "/baby_penguin.png",
    adult: "/penguin.png",
  };

  // Listen to auth state changes
  useEffect(() => {
    setHydrated(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setPetDataPath(`/users/${currentUser.uid}/petData`);
      } else {
        setPetDataPath(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize pet data if not present
  useEffect(() => {
    if (!user) return;
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
  }, [pet, user, update]);

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

  // Stage progression
  useEffect(() => {
    if (!pet) return;
    const now = Date.now();

    const determineStage = () => {
      if (pet.stage === "egg" && pet.health > 60 && pet.energy > 60) {
        if (!pet.babyTime || now - pet.eggTime > 300000) {
          setStage("baby");
          update({ stage: "baby", babyTime: now });
        }
      } else if (pet.stage === "baby" && pet.health > 80 && pet.energy > 80) {
        if (!pet.adultTime || now - pet.babyTime > 300000) {
          setStage("adult");
          update({ stage: "adult", adultTime: now });
        }
      }
    };

    const interval = setInterval(determineStage, 1000); // Check every second
    return () => clearInterval(interval); // Cleanup
  }, [pet, update]);

  // Ensure hydration
  if (!hydrated) return null;

  if (!user) {
    // User is not signed in
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-200 to-purple-300">
        <h1 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">
          Welcome to Kempigotchi!
        </h1>
        <button
          onClick={signInWithGoogle}
          className="bg-white text-blue-500 px-4 py-2 rounded shadow-md hover:bg-gray-100"
          aria-label="Sign in with Google"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (error) return <h1 className="text-red-500">Error: {error.message}</h1>;
  if (pet === undefined || pet === null) return <h1>Loading...</h1>;

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
      {/* Sign Out Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
          aria-label="Sign Out"
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
            aria-label="Edit pet title"
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
                {/* Heart SVG path */}
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
                {/* Heart SVG path */}
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            )}
          </span>
        ))}
      </div>

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
