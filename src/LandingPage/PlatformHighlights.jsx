import React from "react";

import landing1 from "./photos/landing1.jpg";
import landing2 from "./photos/landing2.jpg";
import landing3 from "./photos/landing3.jpg";
import landing4 from "./photos/landing4.jpg";
import landing5 from "./photos/landing5.jpeg";
import landing6 from "./photos/landing6.jpeg";

const images = [landing1, landing2, landing3, landing4, landing5, landing6];
const PlatformHighlights = () => {
  const highlights = [
    {
      title: "Story Creation",
      description:
        "Craft travel stories with text, photos, and memories — all in one intuitive editor designed for storytellers.",
      color: "bg-[#EDF2F4]",
      border: "border-[#EF233C]/30",
    },
    {
      title: "Map & Planning",
      description:
        "Plan your trips with smart maps that mark your adventures and inspire your next destination.",
      color: "bg-[#8D99AE]/10",
      border: "border-[#8D99AE]/40",
    },
    {
      title: "Community Spaces",
      description:
        "Join topic-based groups, discuss destinations, and make lifelong connections with other explorers.",
      color: "bg-[#EF233C]/10",
      border: "border-[#EF233C]/40",
    },
    {
      title: "Photo Sharing",
      description:
        "Upload your best moments and showcase them to a global audience of fellow travelers.",
      color: "bg-[#D90429]/10",
      border: "border-[#D90429]/40",
    },
    {
      title: "Travel Insights",
      description:
        "Discover personalized recommendations, blogs, and guides based on your interests and destinations.",
      color: "bg-[#2B2D42]/10",
      border: "border-[#2B2D42]/30",
    },
    {
      title: "Rewards & Recognition",
      description:
        "Earn badges and recognition for your contributions, stories, and community participation.",
      color: "bg-[#8D99AE]/10",
      border: "border-[#8D99AE]/30",
    },
  ];

  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2B2D42] mb-4">
          Everything You Need in One Platform
        </h2>
        <p className="text-[#8D99AE] text-lg max-w-2xl mx-auto mb-12">
          Experience a complete travel ecosystem that connects your journeys, stories, and memories.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((item, index) => (
            <div
              key={index}
              className={`${item.color} ${item.border} border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:scale-[1.03] overflow-hidden animate-fadeIn  `}
            >
              
              
              <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center bg-white shadow-md">
                {/* Placeholder icon or image */}
                <span className="text-[#EF233C] text-2xl font-bold">★</span>
              </div>
              <h3 className="text-xl font-semibold text-[#2B2D42] mb-2 ">
                {item.title}
              </h3>
              <p className="text-[#555] leading-relaxed ">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformHighlights;
