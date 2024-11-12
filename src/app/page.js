// we initially plan to use CSR only, no SSR, for the entire app
"use client";
import { useDbData, useDbUpdate } from "./utilities/firebase";

export default function Home() {
  const [pet, error] = useDbData("/kempigotchi");
  const [update, result] = useDbUpdate("/kempigotchi");

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

      {/* Refresher: ternary operator */}
      {/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator */}

      {/* TLDR */}
      {/* A ? B : C */}
      {/* is "A" true? if so, then "B". if not, then "C" */}
      <button
        className="bg-purple-100"
        onClick={() =>
          update({ growth: pet.growth === "baby" ? "adult" : "baby" })
        }
      >
        Toggle growth stage between baby/adult
      </button>
    </div>
  );
}
