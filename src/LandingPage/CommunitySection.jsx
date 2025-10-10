import React from "react";

const CommunitySection = () => {
  return (
    <section className="w-full py-24 bg-[#2B2D42] text-[#EDF2F4]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Left Content */}
        <div className="w-full md:w-1/2 space-y-6 animate-fadeIn">
          <h2 className="text-3xl md:text-4xl font-bold text-[#EDF2F4] leading-tight">
            Join a Thriving Community of  <span className="leckerli text-[#EF233C]">Travelers</span> 
          </h2>
          <p className="text-[#8D99AE] text-lg leading-relaxed">
            Connect with explorers from around the globe. Share stories, swap travel tips,
            and discover new destinations through the eyes of other adventurers.
          </p>

          <ul className="space-y-3 text-[#EDF2F4]/90">
            <li className="flex items-center gap-3">
              <span className="text-[#EF233C] text-lg">✔</span>
              Create or join travel groups and meetups
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#EF233C] text-lg">✔</span>
              Share your travel stories in dedicated spaces
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#EF233C] text-lg">✔</span>
              Connect with people who share your passions
            </li>
          </ul>

          <div className="pt-6">
            <button className="px-6 py-3 bg-[#EF233C] hover:bg-[#D90429] text-white font-semibold rounded-full transition-all duration-300 hover:scale-[1.05]">
              Join the Community
            </button>
          </div>
        </div>

        {/* Right Image / Illustration Placeholder */}
        <div className="w-full md:w-1/2 relative animate-fadeIn md:animate-fadeIn delay-200">
          <div className="w-full h-80 md:h-[420px] bg-[#8D99AE]/20 rounded-2xl overflow-hidden flex items-center justify-center">
            {/* Placeholder - replace later with real image */}
            <div className="w-40 h-40 bg-[#EF233C]/30 rounded-full blur-2xl absolute animate-pulse"></div>
            <div className="text-[#8D99AE] text-xl font-medium z-10">
              Community Image / Illustration
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats / Social Proof Section */}
      <div className="max-w-6xl mx-auto mt-20 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center animate-fadeIn">
        <div>
          <h3 className="text-3xl font-bold text-[#EF233C]">250K+</h3>
          <p className="text-[#8D99AE]">Active Members</p>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-[#EF233C]">10K+</h3>
          <p className="text-[#8D99AE]">Communities Created</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <h3 className="text-3xl font-bold text-[#EF233C]">1M+</h3>
          <p className="text-[#8D99AE]">Stories Shared</p>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
