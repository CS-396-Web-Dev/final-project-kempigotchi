// we initially plan to use CSR only, no SSR, for the entire app
"use client";
import { useDbData, useDbUpdate } from "./utilities/firebase";
import { useEffect, useState } from "react";

export default function Home() {
  const [pet, error] = useDbData("/kempigotchi");
  const [update, result] = useDbUpdate("/kempigotchi");
  const [currentTime, setCurrentTime] = useState(Date.now()); // To trigger re-renders

  // Kevin: This manually updates the browser every second, I have not found a way to let
  // the broswer automatically updates with firebase yet. But this should do the work.
  useEffect(() => {
    // Set an interval to update the current time every second
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // This updates the health, happiness, and energy with time
  useEffect(() => {
    if (pet && pet.lastUpdated) {
      const now = Date.now();
      const lastUpdated = new Date(pet.lastUpdated).getTime();
      const elapsedSeconds = Math.floor((now - lastUpdated) / 1000);

      // Assuming decrease rate of 1 per 5 seconds for each attribute
      const decreaseRate = 5; // seconds
      const decreaseAmount = Math.floor(elapsedSeconds / decreaseRate);

      if (decreaseAmount > 0) {
        // Calculate new values with decrease
        const newHealth = Math.max(0, pet.health - decreaseAmount);
        const newEnergy = Math.max(0, pet.energy - decreaseAmount);
        const newHappiness = Math.max(0, pet.happiness - decreaseAmount);

        // Update pet data in firebase
        update({
          health: newHealth,
          energy: newEnergy,
          happiness: newHappiness,
          lastUpdated: now,
        });
      }
    }
  }, [pet, currentTime, update]);

  if (error) return <h1>Error loading data: {error.toString()}</h1>;
  if (pet === undefined) return <h1>Loading data...</h1>;
  if (!pet) return <h1>No pet found.</h1>;

  const MAX_STAT_VALUE = 100;

  const handleFeed = () => {
    const newEnergy = Math.min(MAX_STAT_VALUE, pet.energy + 10);
    update({energy: newEnergy});
  }
  const handlePlay = () => {
    const newHappiness = Math.min(MAX_STAT_VALUE, pet.happiness + 10);
    update({happiness: newHappiness});

  }
  const handleClean = () => {
    const newHealth = Math.min(MAX_STAT_VALUE, pet.health + 10);
    update({health: newHealth});

  }


  return (
    <div>
      <h1>Hi, I&apos;m Kempi, your new Kempigotchi pet.</h1>

      <p>Energy: {pet.energy}</p>
      <p>Happiness: {pet.happiness}</p>
      <p>Health: {pet.health}</p>
      <p>Growth stage: {pet.growth}</p>

      <br />
      
      {/* Interaction Buttons */}
      <div className="flex flex-row justify-around items-center w-full max-w-md mt-6">
        <button
          className="bg-purple-300 hover:bg-purple-400 text-black font-semibold py-2 px-6 rounded-full shadow-md"
          onClick={handleFeed}
          aria-label="Feed the pet to increase energy"
        >
          Feed
        </button>

        <button
          className="bg-purple-300 hover:bg-purple-400 text-black font-semibold py-2 px-6 rounded-full shadow-md"
          onClick={handlePlay}
          aria-label="Play with the pet to increase happiness"
        >
          Play with
        </button>

        <button
          className="bg-purple-300 hover:bg-purple-400 text-black font-semibold py-2 px-6 rounded-full shadow-md"
          onClick={handleClean}
          aria-label="Clean the pet to increase health"
        >
          Clean
        </button>
      </div>

      <h1>Here are some examples on updating the database values:</h1>

      <button className="bg-purple-300" onClick={() => update({ energy: 100 })}>
        Set energy to 100
      </button>

      <button
        className="bg-purple-500"
        onClick={() => update({ energy: pet.energy - 5 })}
      >
        Decrease energy by 5
      </button>

      <button
        className="bg-purple-100"
        onClick={() =>
          update({ growth: pet.growth === "baby" ? "adult" : "baby" })
        }
      >
        Toggle growth stage between baby/adult
      </button>
      
      {/* Button to initialize everything to 100, for testing purpose */}
      <button
        className="bg-green-300"
        onClick={() => 
          update({ lastUpdated: Date.now(), health: 100, energy: 100, happiness: 100 })
        }
      >
        Initialize Pet Data
      </button>

    </div>
  );
}
