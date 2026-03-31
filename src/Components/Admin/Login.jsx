import React, { useState } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";
import PleaseWait from "../comm/PleaseWait";
import logo from "../../assets/images.png";

// Bringing in the Global Theme variables for consistency
const LoginGlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');

  :root {
    --g1: #ff6b2b;
    --g2: #ff4a6e;
    --g3: #c026d3;
    --grad:       linear-gradient(135deg, #ff6b2b 0%, #ff4a6e 50%, #c026d3 100%);
    --grad-soft:  linear-gradient(135deg, rgba(255,107,43,0.10) 0%, rgba(192,38,211,0.10) 100%);
    --grad-hover: linear-gradient(135deg, rgba(255,107,43,0.13) 0%, rgba(192,38,211,0.13) 100%);
    --white:   #ffffff;
    --bg:      #f7f7fb;
    --border:  #ede9f5;
    --border2: #ddd8ee;
    --th:  #0d0b1e;
    --tb:  #35304f;
    --tm:  #9490aa;
    --r1: 8px; --r2: 12px; --r3: 18px; --r4: 24px;
    --shadow-sm: 0 2px 12px rgba(20,5,60,0.07);
    --shadow-md: 0 6px 28px rgba(20,5,60,0.09);
    --shadow-lg: 0 16px 56px rgba(20,5,60,0.13);
    --font-ui:      'Outfit', sans-serif;
    --font-serif:   'Instrument Serif', serif;
  }
`;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend API Call
      const res = await apiRequest.post("admin/login", {
        identifier: formData.email,
        password: formData.password,
      });

      // Handle Success
      if (res.status === "success") {
        localStorage.setItem("userRole", res.admin.role);
        localStorage.setItem("userName", res.admin.name);
        localStorage.setItem("userId", res.admin.id);
        localStorage.setItem("userEmail", res.admin.email);
        
        alert.toast(`Access Granted. Welcome ${res.admin.name}!`);
        
        navigate("/admin/Dashboard"); 
      } else {
        alert.error(res.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert.error(error.response?.data?.message || "Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginGlobalStyle />
      <LoginContainer>
        <PleaseWait show={loading} message="AUTHENTICATING ADMIN..." />

        <MainCard onSubmit={handleLogin}>
          
          {/* Top Section: Branding */}
          <BrandHeader>
            <LogoBox>
              <BrandLogo src={logo} alt="Octane Fit City" />
            </LogoBox>
            <BrandText>
              <BrandName>OCTANE <Accent>FIT CITY</Accent></BrandName>
              <BrandTagline>Fitter · Healthier · Happier</BrandTagline>
            </BrandText>
          </BrandHeader>

          <Divider />

          {/* Bottom Section: Form */}
          <Header>
            <Title>Admin Portal</Title>
            <Sub>Sign in to manage operations</Sub>
          </Header>

          <InputGroup>
            <Label>Email or Mobile</Label>
            <InputWrapper>
              <i className="fa-solid fa-envelope icon"></i>
              <Input
                type="text"
                placeholder="Enter your credentials"
                required
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Secure Password</Label>
            <InputWrapper>
              <i className="fa-solid fa-lock icon"></i>
              <Input
                type="password"
                placeholder="••••••••"
                required
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </InputWrapper>
          </InputGroup>

          <LoginButton type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Login to Terminal"}
          </LoginButton>

          <FooterLink>Forgot security credentials? Contact IT Support</FooterLink>
        </MainCard>
      </LoginContainer>
    </>
  );
}

// --- Styled Components ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: var(--bg); 
  position: relative;
  overflow: hidden;
  font-family: var(--font-ui);
`;

const MainCard = styled.form`
  position: relative;
  z-index: 10;
  width: 90%;
  max-width: 480px; 
  background: var(--white);
  padding: 40px 45px;
  border-radius: var(--r4);
  box-shadow: var(--shadow-lg);
  animation: ${fadeIn} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 30px 25px;
  }
`;

const BrandHeader = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const LogoBox = styled.div`
  width: 60px; height: 60px;
  border-radius: 14px;
  background: var(--grad);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 20px rgba(255,74,110,0.30);
  padding: 2px;
`;

const BrandLogo = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: contain; 
  background: var(--white);
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BrandName = styled.h1`
  font-family: var(--font-ui);
  font-size: 1.9rem; 
  font-weight: 900; 
  color: var(--th);
  text-transform: uppercase;
  letter-spacing: 2.5px; 
  line-height: 1.1;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; 
  white-space: nowrap; /* 🔥 Keeps text on a single line */

  /* 🔥 Shrinks text to fit small mobile screens */
  @media (max-width: 480px) {
    font-size: 1.35rem; 
    letter-spacing: 1px;
    gap: 4px;
  }
`;

const Accent = styled.span`
  background: var(--grad);
  -webkit-background-clip: text; 
  -webkit-text-fill-color: transparent; 
  background-clip: text;
  font-style: italic; 
  filter: drop-shadow(0px 4px 8px rgba(255, 74, 110, 0.35)); 
`;

const BrandTagline = styled.p`
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.9rem;
  color: var(--tm);
  margin: 0;
  letter-spacing: 0.3px;
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: var(--border);
  margin: 24px 0;
`;

const Header = styled.div`
  margin-bottom: 24px;
  text-align: center;
`;

const Title = styled.h2`
  font-family: var(--font-serif);
  color: var(--th);
  font-size: 2rem;
  font-weight: 400;
  font-style: italic;
  margin: 0 0 4px;
  letter-spacing: 0.5px;
`;

const Sub = styled.p`
  font-family: var(--font-ui);
  color: var(--tm);
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-family: var(--font-ui);
  color: var(--tb);
  font-size: 0.75rem;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  .icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--tm);
    font-size: 1rem;
    transition: color 0.3s;
  }

  &:focus-within .icon {
    color: var(--g2);
  }
`;

const Input = styled.input`
  width: 100%;
  font-family: var(--font-ui);
  font-weight: 600;
  background: var(--bg);
  border: 1px solid var(--border2);
  padding: 14px 16px 14px 44px;
  border-radius: var(--r1);
  color: var(--tb);
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &::placeholder {
    color: var(--tm);
    font-weight: 500;
  }

  &:focus {
    outline: none;
    border-color: var(--g2);
    background: var(--white);
    box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1);
  }
`;

const LoginButton = styled.button`
  width: 100%;
  background: var(--grad);
  color: var(--white);
  padding: 16px;
  border-radius: var(--r1);
  font-family: var(--font-ui);
  font-weight: 800;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 10px;
  box-shadow: 0 4px 15px rgba(255, 74, 110, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 74, 110, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    background: var(--border2);
    color: var(--tm);
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const FooterLink = styled.p`
  text-align: center;
  font-family: var(--font-ui);
  color: var(--tm);
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 24px;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover { 
    color: var(--g2); 
  }
`;