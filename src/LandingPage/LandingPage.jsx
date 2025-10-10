import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import Features from './Features';
import PlatformHighlights from './PlatformHighlights';
import CommunitySection from './CommunitySection';
import FinalCTA from './FinalCTA';
import Footer from './Footer';

const LandingPage = () => {
  const navigate = useNavigate();
  const isAccessToken = useSelector(state => state.user.isAccessToken);

  useEffect(() => {
    if (isAccessToken) navigate('/home');
  }, [isAccessToken]);

  return (
    <div className="font-sans bg-[#ffffff] text-[#2B2D42] h-[200vh]">
      <Navbar />
      <HeroSection />
      <Features />
      <PlatformHighlights />
      <CommunitySection />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
