import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes, css } from 'styled-components';

// --- 1. Global Styles & Animations ---

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Oswald:wght@500;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    background-color: #111;
    color: #fff;
    overflow-x: hidden;
    font-family: 'Montserrat', sans-serif; /* Clean, modern body font */
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3 {
    font-family: 'Oswald', sans-serif; /* Strong, athletic heading font */
    letter-spacing: 1px;
  }
`;

const blink = keyframes`
  from, to { border-color: transparent }
  50% { border-color: #ff4500 }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0) rotate(45deg); }
  40% { transform: translateY(-15px) rotate(45deg); }
  60% { transform: translateY(-7px) rotate(45deg); }
`;

// --- 2. Styled Components ---

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  width: 100%;
  padding: 15px 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent);

  @media (max-width: 768px) {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  
  img {
    height: 70px;
    width: auto;
  }
`;

const NavLinks = styled.div`
  a {
    color: #fff;
    text-decoration: none;
    margin-left: 30px;
    font-weight: 600;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: color 0.3s ease;

    &:hover {
      color: #ff4500;
    }

    @media (max-width: 768px) {
      margin: 0 10px;
    }
  }
`;

const WelcomeScreen = styled.section`
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;
`;

const VideoContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
  overflow: hidden;

  video {
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    object-fit: cover;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  z-index: -1;
`;

const HeroContent = styled.div`
  z-index: 1;
  max-width: 800px;
  padding: 20px;
`;

const TypewriterText = styled.h1`
  font-size: 4.5rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 20px;
  min-height: 90px; 
  color: #fff;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 2.8rem;
    min-height: 60px;
  }
`;

const Cursor = styled.span`
  border-right: ${props => props.$isComplete ? 'none' : '4px solid #ff4500'};
  ${props => props.$isComplete 
    ? 'animation: none;' 
    : css`animation: ${blink} 0.75s step-end infinite;`
  }
`;

const SubHeading = styled.p`
  font-size: 1.3rem;
  font-weight: 400;
  letter-spacing: 1px;
  margin-bottom: 40px;
  color: #ccc;
  opacity: 0;
  animation: ${fadeInUp} 1s ease 2s forwards;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CtaButton = styled.a`
  font-family: 'Oswald', sans-serif;
  padding: 15px 45px;
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  background-color: #ff4500;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  text-decoration: none;
  opacity: 0;
  display: inline-block;
  animation: ${fadeInUp} 1s ease 2.5s forwards;
  transition: transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #e03e00;
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 10px 20px rgba(255, 69, 0, 0.3);
  }
`;

const ScrollDown = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  animation: ${fadeInUp} 1s ease 3s forwards, ${bounce} 2s infinite 4s;

  span {
    display: block;
    width: 20px;
    height: 20px;
    border-bottom: 3px solid #ff4500;
    border-right: 3px solid #ff4500;
    transform: rotate(45deg);
  }
`;

const FeaturesSection = styled.section`
  padding: 100px 50px;
  text-align: center;
  background-color: #111;
`;

const SectionTitle = styled.h2`
  font-size: 2.8rem;
  color: #ff4500;
  margin-bottom: 50px;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const CardsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
`;

const Card = styled.div`
  background: #222;
  padding: 40px 30px;
  border-radius: 10px;
  width: 320px;
  transform: translateY(50px);
  opacity: 0;
  transition: all 0.8s ease;
  transition-delay: ${props => props.$delay || '0s'};

  &.show {
    transform: translateY(0);
    opacity: 1;
  }

  h3 {
    font-size: 1.8rem;
    margin-bottom: 15px;
    color: #fff;
  }

  p {
    color: #aaa;
    line-height: 1.7;
    font-size: 1rem;
  }
`;

// --- New Contact Section Styles ---

const ContactSection = styled.section`
  padding: 100px 50px;
  background-color: #1a1a1a;
  text-align: center;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto 50px auto;
  text-align: left;
`;

const ContactCard = styled.div`
  background: #222;
  padding: 35px 30px;
  border-radius: 10px;
  border-top: 4px solid #ff4500;

  h3 {
    font-size: 1.5rem;
    color: #ff4500;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  p, a {
    color: #ccc;
    font-size: 1.05rem;
    line-height: 1.8;
    display: block;
    text-decoration: none;
    margin-bottom: 10px;
    transition: color 0.3s ease;
  }

  a:hover {
    color: #fff;
  }
`;

const MapContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #333;
  
  iframe {
    width: 100%;
    height: 400px;
    border: 0;
    display: block;
  }
`;


// --- 3. Main Component Logic ---

const OctaneGym = () => {
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const textToType = "Welcome to Octane Fit City";
  
  const cardRefs = useRef([]);

  useEffect(() => {
    let charIndex = 0;
    
    const startDelay = setTimeout(() => {
      const typingInterval = setInterval(() => {
        if (charIndex < textToType.length) {
          setTypedText(textToType.substring(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => setIsTypingComplete(true), 3000);
        }
      }, 100);

      return () => clearInterval(typingInterval);
    }, 500);

    return () => clearTimeout(startDelay);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target); 
          }
        });
      },
      { threshold: 0.2 }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  // --- 4. Component Render ---
  return (
    <>
      <GlobalStyle />

      <Navbar>
        <Logo>
          <img src="/images-removebg-preview.png" alt="Octane Fit City Logo" />
        </Logo>
        <NavLinks>
          <a href="#home">Home</a>
          <a href="#features">Programs</a>
          <a href="#contact">Contact</a>
        </NavLinks>
      </Navbar>

      <WelcomeScreen id="home">
        <VideoContainer>
          <video autoPlay loop muted playsInline>
            <source src="/VideoProject.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </VideoContainer>
        
        <Overlay />

        <HeroContent>
          <TypewriterText>
            <span>{typedText}</span>
            <Cursor $isComplete={isTypingComplete} />
          </TypewriterText>
          
          <SubHeading>Fitter. Healthier. Happier.</SubHeading>
          <CtaButton href="/login">Join Today</CtaButton>
        </HeroContent>

        <ScrollDown>
          <span />
        </ScrollDown>
      </WelcomeScreen>

      <FeaturesSection id="features">
        <SectionTitle>Why Choose Octane</SectionTitle>
        <CardsContainer>
          <Card ref={addToRefs} $delay="0s">
            <h3>Elite Equipment</h3>
            <p>State-of-the-art machines and free weights designed to push you past your limits safely and effectively.</p>
          </Card>
          
          <Card ref={addToRefs} $delay="0.2s">
            <h3>Expert Trainers</h3>
            <p>Learn from certified professionals who build custom plans tailored exactly to your body and goals.</p>
          </Card>
          
          <Card ref={addToRefs} $delay="0.4s">
            <h3>24/7 Access</h3>
            <p>Your fitness journey doesn't have a curfew. Train on your schedule, day or night, with our secure entry system.</p>
          </Card>
        </CardsContainer>
      </FeaturesSection>

      {/* --- NEW CONTACT SECTION --- */}
      <ContactSection id="contact">
        <SectionTitle>Get In Touch</SectionTitle>
        
        <ContactGrid>
          <ContactCard>
            <h3>Call Us 24/7</h3>
            <a href="tel:6358051927">📞 +91 63580 51927</a>
            <a href="tel:6358051924">📞 +91 63580 51924</a>
          </ContactCard>

          <ContactCard>
            <h3>Email Us</h3>
            <a href="mailto:octanefitcity2023@gmail.com">✉️ octanefitcity2023@gmail.com</a>
            <a href="mailto:info@octanefitcity.com">✉️ info@octanefitcity.com</a>
          </ContactCard>

          <ContactCard>
            <h3>Visit Us</h3>
            <p>📍 2nd and 3rd floor, SR plaza,<br/>
               Manubar chowkdi, Bharuch-Dahej Road,<br/>
               Bharuch, Gujarat, India-392001</p>
          </ContactCard>
        </ContactGrid>

        <MapContainer>
          {/* Google Maps Embed pointing to SR Plaza, Bharuch */}
          <iframe 
            title="Octane Fit City Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3707.035512178917!2d72.95968537527537!3d21.70134548012163!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be027703bf53605%3A0x73aed24c9262e2ae!2sOctane%20fit%20city!5e0!3m2!1sen!2sin!4v1776150666468!5m2!1sen!2sin" 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </MapContainer>
      </ContactSection>
    </>
  );
};

export default OctaneGym;