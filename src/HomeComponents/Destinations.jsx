import React, { useEffect, useState } from "react";

const Destinations = ({
  destinations,
  setDestinations,
  errors,
  setErrors
}) => {
  

  const saveDestination = () => {
    const newErrors = destinations.map((destination) => ({
      cityError: "",
      stateError: "",
      countryError: "",
    }));
  
    
  
    destinations.forEach((destination, index) => {
      const { city, state, country } = destination;
      
     
      if (city.trim() === "") {
        newErrors[index].cityError = "City should not be empty";
        
      }
      if (state.trim() === "") {
        newErrors[index].stateError = "State should not be empty";
        
      }
      if (country.trim() === "") {
        newErrors[index].countryError = "Country should not be empty";
       
      }
  
     
      const isAlpha = (char) => {
        const code = char.charCodeAt(0);
        return (
          (code >= 65 && code <= 90) || 
          (code >= 97 && code <= 122) || code===32  
        );
      };
  
      for (let char of city) {
        if (!isAlpha(char)) {
          newErrors[index].cityError = "City should only contain letters A-Z";
          
          break;
        }
      }
  
      for (let char of state) {
        if (!isAlpha(char)) {
          newErrors[index].stateError = "State should only contain letters A-Z";
          
          break;
        }
      }
  
      for (let char of country) {
        if (!isAlpha(char)) {
          newErrors[index].countryError = "Country should only contain letters A-Z";
         
          break;
        }
      }
    });
  
    setErrors(newErrors);
  
    
  };
  useEffect(()=>{
    saveDestination()
  },[destinations])

  const handleAddress = (e, i) => {
    const { name, value } = e.target;
    const updatedDestination = [...destinations];
    updatedDestination[i][name] = value;
    setDestinations(updatedDestination);
  };
  const addDestinationCount = () => {
    setDestinations((prev) => [...prev, { city: "", state: "", country: "" }]);
    setErrors((prev) => [
      ...prev,
      { cityError: "", stateError: "", countryError: "" },
    ]);
  };

  const removeDestination = (index) => {
    setDestinations((prev) =>
      prev.filter((_, i) => i !== index )
    );
    setErrors((prev) =>
    prev.filter((_, i) => i !== index )
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
              
              Destination {i + 1}
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
            {errors[i].cityError && (
              <p className="bg-white text-red-500 text-sm font-semibold px-3 py-2 rounded-lg">
                {errors[i].cityError}
              </p>
            )}

            <input
              name="state"
              value={d.state}
              placeholder="state"
              onChange={(e) => {
                handleAddress(e, i);
              }}
              className="bg-[#EDF2F4] px-2 py-4 rounded-lg focus:outline-none text-xl text-black "
            />
            {errors[i].stateError && (
              <p className="bg-white text-red-500 text-sm font-semibold px-3 py-2 rounded-lg">
                {errors[i].stateError}
              </p>
            )}

            <input
              name="country"
              value={d.country}
              placeholder="country"
              onChange={(e) => {
                handleAddress(e, i);
              }}
              className="bg-[#EDF2F4] px-2 py-4 rounded-lg focus:outline-none text-xl text-black "
            />
            {errors[i].countryError && (
              <p className="bg-white text-red-500 text-sm font-semibold px-3 py-2 rounded-lg">
                {errors[i].countryError}
              </p>
            )}

            <div
              className={` absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer bg-white rounded-full flex items-center justify-center px-4 py-4 `}
              onClick={() => {
                removeDestination(i);
              }}
            >
              <i className="bx bx-trash text-3xl text-[#EF233C] "></i>
            </div>
          </div>
        );
      })}

      <div className=" w-full py-5  flex flex-col items-center justify-center gap-5">
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
