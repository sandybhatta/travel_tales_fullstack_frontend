import React, { useState } from "react";

const Destinations = ({
  setDestinationOpen,
  destinations,
  setDestinations,
}) => {
  const [destinationCount, setDestinationCount] = useState(1);

  const handleAddress = (e, i) => {
    const { name, value } = e.target;
    const updatedDestination = [...destinations];
    updatedDestination[i][name] = value;
    setDestinations(updatedDestination);
  };
  const addDestinationCount = () => {
    setDestinations((prev) => [...prev, { city: "", state: "", country: "" }]);
  };
  const removeDestination = (index) => {
    setDestinations((prev) =>
      prev.filter((_, i) => i !== index && prev.length > 1)
    );
  };
  return (
    <div className="w-full " onClick={(e) => e.stopPropagation()}>
      {destinations.map((d, i) => {
        return (
          <div
            className="w-full h-auto  flex flex-col items-center justify-center py-10 px-10 gap-5 relative"
            key={i}
          >
            <h2 className="text-3xl text-white font-semibold">
              {" "}
              Destination {i + 1}{" "}
            </h2>

            <input
              name="city"
              value={d.city}
              placeholder="city"
              onChange={(e) => {
                handleAddress(e, i);
              }}
              className="bg-[#EDF2F4] px-2 py-4 rounded-lg focus:outline-none text-xl text-black "
            />

            <input
              name="state"
              value={d.state}
              placeholder="state"
              onChange={(e) => {
                handleAddress(e, i);
              }}
              className="bg-[#EDF2F4] px-2 py-4 rounded-lg focus:outline-none text-xl text-black "
            />

            <input
              name="country"
              value={d.country}
              placeholder="country"
              onChange={(e) => {
                handleAddress(e, i);
              }}
              className="bg-[#EDF2F4] px-2 py-4 rounded-lg focus:outline-none text-xl text-black "
            />

            <div
              className={`${
                i === 0 ? "hidden" : "block"
              } absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer bg-white rounded-full flex items-center justify-center px-4 py-4 `}
              onClick={() => {
                removeDestination(i);
              }}
            >
              <i className="bx bx-trash text-3xl text-[#EF233C] "></i>
            </div>
          </div>
        );
      })}

      <div className=" w-full py-5  flex flex-col items-center justify-center">
        <div
          className="flex flex-col items-center justify-center bg-green-500 rounded-lg px-5 py-3 cursor-pointer gap-2 "
          onClick={() => addDestinationCount()}
        >
          <i className="bx bx-plus-circle text-3xl text-white"></i>
          <h4 className="text-3xl text-white"> Add More Destinations</h4>
        </div>
      </div>
    </div>
  );
};

export default Destinations;
