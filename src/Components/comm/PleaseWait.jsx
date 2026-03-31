import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
// Ensure your logo file is in the same directory or adjust the path
import logo from "../../assets/logo.png"; 

const QUOTES = [
  "Lifting your data...",
  "Crushing the weights...",
  "Almost game time...",
  "Checking the gains...",
  "Fueling up...",
];

export default function PleaseWait({ show = false, message }) {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    if (show) {
      const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setQuote(randomQuote);
    }
  }, [show]);

  if (!show) return null;

  return (
    <Overlay>
      <LoaderBox>
        <Logo src={logo} alt="Octane Fit City" />
        <Message>{message || quote}</Message>
        <LoadingLine />
      </LoaderBox>
    </Overlay>
  );
}

// --- ANIMATIONS ---
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.9; }
`;

const slide = keyframes`
  0% { left: -100%; }
  100% { left: 100%; }
`;

// --- STYLES ---
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  /* Added transparency: 85% opacity black */
  background: rgba(0, 0, 0, 0.85); 
  /* Optional: Adds a subtle blur to the content behind the loader */
  backdrop-filter: blur(4px); 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const LoaderBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  width: 80%;
  max-width: 400px;
`;

const Logo = styled.img`
  width: 180px; 
  height: auto;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const Message = styled.h2`
  color: rgba(255, 255, 255, 0.9); /* Slight off-white for better readability */
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.95rem;
  letter-spacing: 1.5px;
  margin: 0;
  text-align: center;
`;

const LoadingLine = styled.div`
  width: 180px;
  height: 3px;
  background: rgba(255, 255, 255, 0.1); /* Lighter track */
  border-radius: 2px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 60px;
    height: 100%;
    background: linear-gradient(90deg, #fb923c, #0ea5e9);
    animation: ${slide} 1.5s infinite linear;
  }
`;