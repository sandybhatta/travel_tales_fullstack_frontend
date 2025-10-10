import React, { useEffect, useRef } from "react";

const Features = () => {
  const features = [
    {
      title: "Create Stunning Photo Stories",
      description:
        "Transform your travel moments into unforgettable visual stories. Express your journey through photos, words, and emotions — and inspire others to explore more.",
      points: [
        "Smart photo editor & templates",
        "Dynamic captions and tags",
        "Built for storytelling travelers",
      ],
      image: null,
    },
    {
      title: "Explore the World Through Interactive Maps",
      description:
        "Navigate the globe your way. Find, mark, and share routes that reveal hidden corners of the world, all with real-time interactive mapping tools.",
      points: [
        "Add your personal routes",
        "Bookmark dream destinations",
        "Discover local gems near you",
      ],
      image: null,
    },
    {
      title: "Connect With Adventurers Worldwide",
      description:
        "Join a thriving travel community. Collaborate, share, and connect with explorers who live for discovery and human connection.",
      points: [
        "Chat and collaborate instantly",
        "Join global travel groups",
        "Grow your adventure network",
      ],
      image: null,
    },
    {
      title: "Plan, Track & Relive Your Journeys",
      description:
        "Keep every journey alive — plan smarter, track effortlessly, and relive your adventures with our personalized memory timeline.",
      points: [
        "Create custom itineraries",
        "Auto-track travel logs",
        "Replay your adventures anytime",
      ],
      image: null,
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
    <section className="w-full py-24 bg-[#EDF2F4] overflow-hidden">
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
                <div className="relative overflow-hidden rounded-xl w-full h-64 bg-[#8D99AE]/20 animate-pulse">
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
                <h3 className="text-2xl font-bold text-[#2B2D42] leading-snug">
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
