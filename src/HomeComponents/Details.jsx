import React from "react";

const TAG_OPTIONS = [
  "adventure","beach","mountains","history","food","wildlife",
  "culture","luxury","budget","road_trip","solo","group",
  "trekking","spiritual","nature","photography","festivals",
  "architecture","offbeat","shopping",
];

const Details = ({ tags, setTags, destinations, setDestinations }) => {

  const handleDestinationChange = (index, field, value) => {
    const updated = [...destinations];
    updated[index][field] = value;

    const { city, state, country } = updated[index];
    const filled = city || state || country;

    updated[index].error =
      filled && !(city && state && country)
        ? "City, State & Country are required together."
        : "";

    setDestinations(updated);
  };

  const addDestination = () => {
    setDestinations([
      ...destinations,
      { city: "", state: "", country: "", error: "" },
    ]);
  };

  const removeDestination = (index) => {
    if (index === 0) return;
    setDestinations(destinations.filter((_, i) => i !== index));
  };

  const toggleTag = (tag) => {
    setTags(
      tags.includes(tag)
        ? tags.filter((t) => t !== tag)
        : [...tags, tag]
    );
  };

  return (
    <div className="w-full flex flex-col gap-10">

      {/* DESTINATIONS */}
      <div className="flex flex-col gap-6 w-full">
        <h2 className="text-lg font-semibold text-gray-800">
          Destinations
        </h2>

        {destinations.map((dest, index) => (
          <div
            key={index}
            className="w-full bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-4 relative"
          >
            <h2 className="text-black font-semibold text-xl">Destination {index+1}</h2>
            {index !== 0 && (
              <button
                onClick={() => removeDestination(index)}
                className="absolute top-4 right-4 text-red-500 hover:scale-110 transition"
              >
                <i className="bx bx-trash text-xl" />
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                placeholder="City"
                value={dest.city}
                onChange={(e) =>
                  handleDestinationChange(index, "city", e.target.value)
                }
                className=" w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition"
              />
              <input
                placeholder="State"
                value={dest.state}
                onChange={(e) =>
                  handleDestinationChange(index, "state", e.target.value)
                }
                className=" w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition"
              />
              <input
                placeholder="Country"
                value={dest.country}
                onChange={(e) =>
                  handleDestinationChange(index, "country", e.target.value)
                }
                className=" w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition"
              />
            </div>

            {dest.error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <i className="bx bx-error-circle" />
                {dest.error}
              </p>
            )}
          </div>
        ))}

        <button
          onClick={addDestination}
          className="self-start flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-full shadow hover:scale-105 transition"
        >
          <i className="bx bx-plus" />
          Add Destination
        </button>
      </div>

      {/* TAGS */}
      <div className="flex flex-col gap-5 w-full">
        <h2 className="text-lg font-semibold text-gray-800">
          Tags
        </h2>

        <div className="flex flex-wrap gap-3">
          {TAG_OPTIONS.map((tag) => {
            const selected = tags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition
                  ${
                    selected
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-red-400"
                  }
                `}
              >
                <i
                  className={`bx ${
                    selected ? "bx-check-circle" : "bx-plus-circle"
                  }`}
                />
                {tag.replace("_", " ")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Details;
