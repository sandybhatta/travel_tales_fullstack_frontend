import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import Features from './Features';
import PlatformHighlights from './PlatformHighlights';
import CommunitySection from './CommunitySection';
import Footer from './Footer';

const LandingPage = () => {
  const navigate = useNavigate();
  const isAccessToken = useSelector(state => state.user.isAccessToken);

  useEffect(() => {
    if (isAccessToken) navigate('/home');
  }, [isAccessToken]);
  
  const featureRef= useRef(null)
  const aboutRef= useRef(null)


  const handleFeatureScroll=()=>{
    featureRef.current.scrollIntoView({behavior:"smooth"})
  }
  const handleAboutScroll=()=>{
    aboutRef.current.scrollIntoView({behavior:"smooth"})
  }

  return (
    <div className="font-sans bg-[#ffffff] text-[#2B2D42] h-[200vh]">
      <Navbar  onFeatureClick={handleFeatureScroll} onAboutClick={handleAboutScroll}/>
      <HeroSection />
      <Features featureRef={featureRef}/>
      <PlatformHighlights aboutRef={aboutRef} />
      <CommunitySection />
      
      <Footer />
    </div>
  );
};

export default LandingPage;
