import React, { useEffect, useRef } from "react";
import landing1 from "./photos/landing1.jpg";
import landing2 from "./photos/landing2.jpg";
import landing3 from "./photos/landing3.jpg";
import landing4 from "./photos/landing4.jpg";


const Features = ({featureRef}) => {
  const features = [
    {
      title: "Create Stunning Photo Stories",
      description:
        "Turn your travel photos into captivating stories that speak louder than words. Use expressive captions, elegant templates, and emotional storytelling tools to bring your journeys to life and inspire fellow explorers.",
      points: [
        "Beautiful, ready-to-use photo story layouts",
        "AI-powered captions and smart tagging",
        "Perfect for travel creators and storytellers",
      ],
      image: landing1,
    },
    {
      title: "Create Trips and Show Your Journey Day by Day",
      description:
        "Document your adventures with detailed, day-by-day trip timelines. Add activities, locations, and memories for each day — creating a vivid story of your journey from start to finish.",
      points: [
        "Add and organize activities per day",
        "Include photos, notes, and highlights",
        "Visualize your journey on a travel timeline",
      ],
      image: landing2,
    },
    {
      title:
        "Connect With Adventurers Worldwide — Add Followers and Close Friends",
      description:
        "Build your travel circle and connect with people who share your wanderlust. Follow travelers you admire, chat with new friends, and add your favorite companions to your close circle for more personal sharing.",
      points: [
        "Follow and interact with global travelers",
        "Chat with friends or create travel groups",
        "Add close friends for exclusive stories",
      ],
      image: landing3,
    },
    {
      title:
        "Plan, Track & Relive Your Trips With Collaborators — Manage Expenses, To-Dos, and Notes",
      description:
        "Plan your next adventure collaboratively with friends. Keep track of expenses, create to-do lists, jot down notes, and relive every moment through your personalized trip dashboard.",
      points: [
        "Collaborate with friends on trip planning",
        "Track expenses, notes, and to-dos easily",
        "Relive memories through your interactive trip log",
      ],
      image: landing4,
    },
  ];
  

  const refs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add("animate-slideIn");
            el.classList.remove("animate-slideOut");
          } else {
            el.classList.remove("animate-slideIn");
            el.classList.add("animate-slideOut");
          }
        });
      },
      { threshold: 0.35 }
    );

    refs.current.forEach((ref) => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={featureRef} className="w-full py-24 bg-[#EDF2F4] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
        {/* Section Heading */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#2B2D42] mb-4">
          <span className="leckerli text-[#EF233C]">Powerful</span> Features for Every Type of <span className="leckerli text-[#EF233C]">Traveler</span>
          
          
        </h2>
        <p className="text-[#8D99AE] text-lg max-w-3xl mx-auto mb-16 leading-relaxed">
          Whether you’re a solo wanderer, storyteller, or group explorer — TravelTales helps you
          create, connect, and celebrate your journeys in your own style.
        </p>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => (refs.current[index] = el)}
              className={`opacity-0 transform transition-all duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col md:flex-row items-center gap-6 p-8 rounded-2xl shadow-md bg-white border border-[#EDF2F4] hover:shadow-xl hover:border-[#EF233C]/30
                ${index % 2 === 0 ? "md:flex-row slide-from-left" : "md:flex-row-reverse slide-from-right"}`}
            >
              {/* Image */}
              <div className="w-full md:w-1/2">
                <div className="relative overflow-hidden rounded-xl w-full h-64 bg-[#8D99AE]/20">
                  {feature.image && (
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="w-full md:w-1/2 text-left space-y-4">
                <h3 className="leckerli text-2xl text-[#EF233C]  font-bold leading-snug">
                  {feature.title}
                </h3>
                <p className="text-[#555] leading-relaxed">{feature.description}</p>
                <ul className="space-y-2 text-[#2B2D42]/90 font-medium">
                  {feature.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#D90429] text-lg font-bold">✦</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
