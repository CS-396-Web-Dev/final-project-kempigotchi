"use client";

import { useEffect, useState } from "react";
import {
  useDbData,
  useDbUpdate,
  auth,
  signInWithGoogle,
  logout,
} from "./utilities/firebase";
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
  const [stage, setStage] = useState("egg");
  const [showAlert, setShowAlert] = useState(false); //On-screen Alert

  const MAX_STAT_VALUE = 100;
  const MAX_ACTIONS = 5; // Maximum number of actions allowed
  const ACTION_REFRESH_INTERVAL = 10 * 60 * 1000; 

  const stageImages = {
    egg: "/egg.png",
    baby: "/baby_penguin.png",
    adult: "/penguin.png",
    dead: "/tombstone.png",
  };

  // Ensure hydration by using useEffect
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
        actions: MAX_ACTIONS, // Initialize actions
        lastActionRefresh: Date.now(), // Initialize lastActionRefresh
        lastUpdated: Date.now(),
        eggTime: Date.now(),
      });
    } else {
      setTitle(pet.title || "My Kempigotchi");
      setStage(pet.stage || "egg");
    }
  }, [pet, user, update]);

  // Ensure default stage is set when the app initializes
  useEffect(() => {
    if (!pet?.stage) {
      setStage("egg"); // Set local state
      update({ stage: "egg", eggTime: Date.now() }); // Initialize in database
    } else {
      setStage(pet.stage); // Sync local state with database stage
    }
  }, [pet, update]);

  // Monitor stage transitions and health (Teammate's logic)
  useEffect(() => {
    if (!pet) return;
    const determineStage = () => {
      // If the pet is already dead, stop further stage transitions
      if (stage === "dead") return;

      // Check if the pet's health is 0, and transition to "dead" stage
      if (pet?.health === 0) {
        console.log("Health is 0. Switching to 'dead' stage.");
        setStage("dead");
        update({ stage: "dead" });
        return; // Exit early to prevent further logic
      }

      const now = Date.now();

      // Transition from "egg" to "baby"
      if (
        pet?.stage === "egg" &&
        pet?.health > 60 &&
        pet?.energy > 60 &&
        pet?.eggTime
      ) {
        if (!pet?.babyTime || now - pet?.eggTime > 300000) {
          // 5 minutes
          setStage("baby");
          update({ stage: "baby", babyTime: now });
        }
      }
      // Transition from "baby" to "adult"
      else if (
        pet?.stage === "baby" &&
        pet?.health > 80 &&
        pet?.energy > 80 &&
        pet?.babyTime
      ) {
        if (!pet?.adultTime || now - pet?.babyTime > 300000) {
          // 5 minutes
          setStage("adult");
          update({ stage: "adult", adultTime: now });
        }
      }
    };

    // Set up an interval to check the stage every second
    const interval = setInterval(determineStage, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [pet, stage, update]);

  // Reset pet to "egg" when it's in "dead" stage or stats are invalid
  const handleReset = () => {
    if (
      stage === "dead" ||
      isNaN(pet.health) ||
      isNaN(pet.energy) ||
      isNaN(pet.happiness)
    ) {
      setStage("egg");
      update({
        stage: "egg",
        eggTime: Date.now(),
        health: 100, // Reset health
        energy: 100, // Reset energy
        happiness: 100, // Reset happiness
        lastUpdated: Date.now(),
      });
    }
  };

  // Fetch the title from the database if available (Teammate's logic)
  useEffect(() => {
    if (pet?.title) {
      setTitle(pet.title);
    }
  }, [pet]);

  // Updates Actions Remaining
  useEffect(() => {
    if (pet && pet.actions === undefined) {
      console.log("Initializing actions...");
      update({
        actions: MAX_ACTIONS,
        lastActionRefresh: Date.now(),
      });
    }
  }, [pet, update]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Periodic action restoration check...");
      restoreActions();
    }, 10000); 
  
    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [pet]);
  
  
  // Automatic deduction of stats
  useEffect(() => {
    if (pet && pet.lastUpdated) {
      const interval = setInterval(() => {
        const now = Date.now();
        const lastUpdated = pet.lastUpdated; // It's a timestamp already
        const elapsedSeconds = Math.floor((now - lastUpdated) / 1000);

        const decreaseRate = 60; // Decrease every 60 seconds
        const decreaseAmount = Math.floor(elapsedSeconds / decreaseRate);

        if (decreaseAmount > 0) {
          const currentHealth = Number(pet.health) || 0;
          const currentEnergy = Number(pet.energy) || 0;
          const currentHappiness = Number(pet.happiness) || 0;

          const newHealth = Math.max(0, currentHealth - decreaseAmount);
          const newEnergy = Math.max(0, currentEnergy - decreaseAmount);
          const newHappiness = Math.max(0, currentHappiness - decreaseAmount);

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
  }, [pet, update, pet?.lastUpdated]);

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

  const handleFeed = () => {
    performAction(() => {
      handleReset(); // Reset if dead or stats invalid
  
      const currentEnergy = Number(pet.energy) || 0;
      const newEnergy = Math.min(MAX_STAT_VALUE, currentEnergy + 10);
  
      update({ energy: newEnergy, lastUpdated: Date.now() });
    });
  };
  
  const handlePlay = () => {
    performAction(() => {
      handleReset(); // Reset if dead or stats invalid
  
      const currentHappiness = Number(pet.happiness) || 0;
      const newHappiness = Math.min(MAX_STAT_VALUE, currentHappiness + 10);
  
      update({ happiness: newHappiness, lastUpdated: Date.now() });
    });
  };
  
  const handleClean = () => {
    performAction(() => {
      handleReset(); // Reset if dead or stats invalid
  
      const currentHealth = Number(pet.health) || 0;
      const newHealth = Math.min(MAX_STAT_VALUE, currentHealth + 10);
  
      update({ health: newHealth, lastUpdated: Date.now() });
    });
  };

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

  const canPerformAction = () => {
    // Check if the user has actions available
    if (!pet?.actions || pet.actions <= 0) {
      console.log("No actions available");
      return false;
    }
  
    console.log("Actions available:", pet.actions);
    return true;
  };
  

  const performAction = (actionCallback) => {
    if (!canPerformAction()) {
      triggerAlert(); // Show alert if no actions available
      return;
    }
  
    // Deduct an action and perform the callback
    update({
      actions: pet.actions - 1,
      lastActionRefresh: pet.lastActionRefresh || Date.now(),
    });
  
    actionCallback();
  };

  const restoreActions = () => {
    if (pet?.lastActionRefresh === undefined) {
      console.log("lastActionRefresh undefined");
      return;
    }
  
    const now = Date.now();
    const elapsedTime = now - pet.lastActionRefresh;
    const actionsToRestore = Math.floor(elapsedTime / ACTION_REFRESH_INTERVAL);
  
    console.log("Elapsed time:", elapsedTime);
    console.log("Actions to restore:", actionsToRestore);
  
    if (actionsToRestore > 0) {
      const newActionCount = Math.min(
        MAX_ACTIONS,
        (pet.actions || 0) + actionsToRestore
      );
  
      console.log("Updating actions...");
      update({
        actions: newActionCount,
        lastActionRefresh: now,
      });
    }
  };
  
  
  // Alert for no actions left
  const triggerAlert = () => {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000); // Alert disappears after 3 seconds
  };
  

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-200 to-purple-300 font-sans overflow-hidden flex flex-col">
      {/* Sign Out Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm md:text-base lg:text-lg"
          aria-label="Sign Out"
        >
          Sign Out
        </button>
      </div>

      {/* Title */}
      <div className="mt-6 w-full text-center px-4">
        {editingTitle ? (
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleSave}
            onKeyDown={handleKeyDown}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white bg-transparent border-b-2 border-white focus:outline-none focus:border-blue-500"
            aria-label="Edit pet title"
          />
        ) : (
          <h1
            onClick={handleTitleClick}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white drop-shadow-lg cursor-pointer"
            title="Click to edit title"
          >
            {title}
          </h1>
        )}
      </div>

      {/* Stats in Top-Left */}
      <div className="absolute top-8 left-8 text-sm md:text-base lg:text-xl font-semibold text-white space-y-4 drop-shadow-lg">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2">
          <span>Health:</span>
          <div className="w-full max-w-xs md:max-w-md bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{
                width: `${(Number(pet.health) / MAX_STAT_VALUE) * 100}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2">
          <span>Energy:</span>
          <div className="w-full max-w-xs md:max-w-md bg-gray-200 rounded-full h-4">
            <div
              className="bg-purple-500 h-4 rounded-full"
              style={{
                width: `${(Number(pet.energy) / MAX_STAT_VALUE) * 100}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2">
          <span>Actions Remaining:</span>
          <div
            className={`w-20 bg-gray-200 rounded-full h-6 flex items-center justify-center ${
              pet?.actions > 0 ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {pet?.actions || 0}
          </div>
        </div>
      </div>

      {/* Happiness on right corner */}
      <div className="absolute top-16 right-8 flex flex-wrap md:flex-nowrap items-center space-x-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} className="w-8 h-8 md:w-10 md:h-10">
            {index <
            Math.round((Number(pet.happiness) / MAX_STAT_VALUE) * 5) ? (
              // Filled hearts
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-red-500"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              // Empty Hearts
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-red-500"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
          </span>
        ))}
      </div>

      {/* Pet Image */}
      <div className="flex flex-col items-center justify-center flex-grow relative px-4">
        <Image
          src={stageImages[stage]} // Dynamically use the image based on the stage
          alt={`${stage} image`} // Alt text updates with the stage
          width={200} // Default width for small screens
          height={200} // Default height for small screens
          className="rounded-full shadow-xl drop-shadow-lg md:w-64 md:h-64 lg:w-96 lg:h-96"
        />

        <div className="flex justify-center space-x-4 md:space-x-8 mt-4 md:mt-8">
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

      {/* Alert No Actions Left*/}
      {showAlert && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-lg font-semibold py-2 px-4 rounded shadow-lg z-50">
          No actions remaining! Wait for actions to refresh.
        </div>
      )}

    </div>
  );
}
