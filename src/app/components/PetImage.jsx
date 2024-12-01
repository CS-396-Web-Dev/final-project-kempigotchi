import Image from "next/image";

const PetImage = ({ stage }) => {
  const stageImages = {
    egg: "/egg.png",
    baby: "/baby_penguin.png",
    adult: "/penguin.png",
    dead: "/tombstone.png",
  };

  return (
    <Image
      src={stageImages[stage]} // Dynamically use the image based on the stage
      alt={`${stage} image`} // Alt text updates with the stage
      width={200} // Default width for small screens
      height={200} // Default height for small screens
      className="rounded-full shadow-xl drop-shadow-lg md:w-64 md:h-64 lg:w-96 lg:h-96"
    />
  );
};

export default PetImage;
