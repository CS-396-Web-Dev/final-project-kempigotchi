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

  // This updates the health, happiness, and hunger with time
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
        const newHunger = Math.max(0, pet.hunger - decreaseAmount);
        const newHappiness = Math.max(0, pet.happiness - decreaseAmount);

        // Update pet data in firebase
        update({
          health: newHealth,
          hunger: newHunger,
          happiness: newHappiness,
          lastUpdated: now,
        });
      }
    }
  }, [pet, currentTime, update]);

  if (error) return <h1>Error loading data: {error.toString()}</h1>;
  if (pet === undefined) return <h1>Loading data...</h1>;
  if (!pet) return <h1>No pet found.</h1>;

  return (
    <div>
      <h1>Hi, I&apos;m Kempi, your new Kempigotchi pet.</h1>

      <p>Hunger: {pet.hunger}</p>
      <p>Happiness: {pet.happiness}</p>
      <p>Health: {pet.health}</p>
      <p>Growth stage: {pet.growth}</p>

      <br />
      <h1>Here are some examples on updating the database values:</h1>

      <button className="bg-purple-300" onClick={() => update({ hunger: 100 })}>
        Set hunger to 100
      </button>

      <button
        className="bg-purple-500"
        onClick={() => update({ hunger: pet.hunger - 5 })}
      >
        Decrease hunger by 5
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
          update({ lastUpdated: Date.now(), health: 100, hunger: 100, happiness: 100 })
        }
      >
        Initialize Pet Data
      </button>

    </div>
  );
}
