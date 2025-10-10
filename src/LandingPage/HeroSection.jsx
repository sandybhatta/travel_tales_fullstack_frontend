import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import landing1 from "./photos/landing1.jpg";
import landing2 from "./photos/landing2.jpg";
import landing3 from "./photos/landing3.jpg";
import landing4 from "./photos/landing4.jpg";
import landing5 from "./photos/landing5.jpeg";
import landing6 from "./photos/landing6.jpeg";
import landing7 from "./photos/landing7.jpeg";

const images = [landing1, landing2, landing3, landing4, landing5, landing6, landing7];

const HeroSection = () => {
  const [ind, setInd] = useState(0);

  // auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setInd((p) => (p < images.length - 1 ? p + 1 : 0));
    }, 2500); // change every 2.5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-[#edf2f4] overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
        
        {/* LEFT TEXT CONTENT */}
        <div className="flex flex-col items-start text-left md:w-1/2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2B2D42] leading-tight">
            Turn Your <span className="text-[#d90429] leckerli">Travels</span> Into{" "}
            <span className="leckerli text-[#ef233c]">Inspiring Stories</span>
          </h1>

          <p className="mt-5 text-lg text-[#8d99ae] max-w-md leading-relaxed">
            Share your journeys, connect with explorers around the world, and
            transform your adventures into unforgettable tales — all in one place.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/register-user"
              className="px-8 py-3 bg-[#ef233c] hover:bg-[#d90429] text-[#edf2f4] text-lg rounded-xl shadow-md transition-all duration-300"
            >
              Start Your Journey
            </Link>

            <Link
              to="#features"
              className="px-8 py-3 border border-[#2B2D42] text-[#2B2D42] hover:bg-[#2B2D42] hover:text-[#edf2f4] text-lg rounded-xl transition-all duration-300"
            >
              Learn More
            </Link>
          </div>

          {/* STATS SECTION */}
          <div className="mt-10 flex flex-wrap gap-6">
            <div>
              <p className="text-3xl font-bold text-[#2B2D42]">50K+</p>
              <p className="text-[#8d99ae]">Active Travelers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#2B2D42]">1.2M+</p>
              <p className="text-[#8d99ae]">Stories Shared</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#2B2D42]">180+</p>
              <p className="text-[#8d99ae]">Countries Explored</p>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE CAROUSEL */}
        <div className=" w-[90%] md:w-1/2 flex justify-center relative top-9 z-200">
          <div className="w-[90%] sm:w-[80%] md:w-[90%] lg:w-[85%] rounded-3xl  shadow-xl relative h-[300px] sm:h-[400px] md:h-[450px]  bg-green-900">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Travel showcase ${i + 1}`}
                className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-700 ease-in-out ${
                  i === ind ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>

          {/* Decorative gradient ring */}
          {/* Decorative animated oval with orbiting balls */}
<div className="absolute -z-10 w-[110%] h-[110%] items-center justify-center hidden md:flex ">
<div className="relative w-full h-full bg-[#ef233c]/10 rounded-[50%] blur-3xl overflow-visible animate-pulse-slow">
    {/* Orbiting balls */}
    
    <span className="absolute left-[20%] top-[20%] w-85 h-85 bg-[#d90429] rounded-full animate-orbit" style={{ animationDelay: "2s" }}></span>

    <span className="absolute left-[35%] top-[30%] w-85 h-85 bg-[#1d61d6] rounded-full animate-orbit" style={{ animationDelay: "4s" }}></span>
    <span className="absolute  left-[50%] top-[10%] w-85 h-85 bg-[#55ff1d] rounded-full animate-orbit" style={{ animationDelay: "6s" }}></span>
    <span className="absolute left-[35%] top-[0%] w-85 h-85 bg-[#ffd503] rounded-full animate-orbit" style={{ animationDelay: "8s" }}></span>
    
  </div>
</div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
