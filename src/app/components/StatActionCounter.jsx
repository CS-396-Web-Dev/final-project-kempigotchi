const StatActionCounter = ({ actions }) => (
  <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2">
    <span>Actions Remaining:</span>
    <div
      className={`w-20 bg-gray-200 rounded-full h-6 flex items-center justify-center ${
        actions > 0 ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {actions || 0}
    </div>
  </div>
);

export default StatActionCounter;
