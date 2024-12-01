const StatBar = ({ statName, statValue, maxStatValue, statColor }) => {
  return (
    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2">
      <span>{statName}:</span>
      <div className="w-full max-w-xs md:max-w-md bg-gray-200 rounded-full h-4">
        <div
          className={`bg-${statColor}-500 h-4 rounded-full`}
          style={{
            width: `${(Number(statValue) / maxStatValue) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default StatBar;
