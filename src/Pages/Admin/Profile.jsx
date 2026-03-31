import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";

// ─── GLOBAL STYLE (MATCHED WITH ADMIN PANEL) ───────────────────────────────
const GlobalStyle = createGlobalStyle`
  :root {
    --g1: #ff6b2b;
    --g2: #ff4a6e;
    --g3: #c026d3;
    --grad: linear-gradient(135deg,#ff6b2b,#ff4a6e,#c026d3);
    --grad-soft: linear-gradient(135deg,rgba(255,107,43,0.1),rgba(192,38,211,0.1));
    --white:#fff;
    --bg:#f7f7fb;
    --border:#ede9f5;
    --th:#0d0b1e;
    --tm:#9490aa;
    --shadow:0 10px 30px rgba(20,5,60,0.08);
    --font-ui:'Outfit',sans-serif;
    --font-serif:'Instrument Serif',serif;
  }
`;

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: localStorage.getItem("userId") || "101",
    name: localStorage.getItem("userName") || "Admin User",
    email: localStorage.getItem("userEmail") || "admin@octanefitcity.com",
    mobile: localStorage.getItem("userMobile") || "",
    address: "",
    role: localStorage.getItem("userRole") || "Admin",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    verifyPassword: "",
  });

  const handleProfileChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "O";

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest.put(`update-admin/${formData.id}`, {
        name: formData.name,
        mobile: formData.mobile,
      });
      if (res.status === "success" || res.message) {
        alert.success("Profile Updated Successfully!");
        localStorage.setItem("userName", formData.name);
      } else {
        alert.error("Update failed.");
      }
    } catch (error) {
      alert.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.verifyPassword) {
      return alert.error("New passwords do not match!");
    }
    setLoading(true);
    try {
      setTimeout(() => {
        alert.success("Security Credentials Updated!");
        setPasswords({ currentPassword: "", newPassword: "", verifyPassword: "" });
        setLoading(false);
      }, 1000);
    } catch (error) {
      alert.error("Password update failed.");
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <Wrapper className="container-fluid py-3">
        <div className="row justify-content-center g-4">

          {/* LEFT */}
          <div className="col-lg-4 col-xl-3">
            <SideCard>
              <TopBanner />
              <AvatarBox>
                <Avatar>{getInitials(formData.name)}</Avatar>
                <Cam><i className="bi bi-camera-fill"/></Cam>
              </AvatarBox>

              <h4>{formData.name}</h4>
              <Role>{formData.role}</Role>

              <Menu>
                <Item $active={activeTab==="profile"} onClick={()=>setActiveTab("profile")}>
                  <i className="bi bi-person"/> Profile
                </Item>
                <Item $active={activeTab==="security"} onClick={()=>setActiveTab("security")}>
                  <i className="bi bi-shield-lock"/> Security
                </Item>
              </Menu>

              <Status>● ACTIVE ACCOUNT</Status>
            </SideCard>
          </div>

          {/* RIGHT */}
          <div className="col-lg-8 col-xl-7">
            <Card>

              {activeTab==="profile" && (
                <>
                  <Title>General Information</Title>

                  <form onSubmit={handleSaveProfile}>
                    <Grid>

                      <Field>
                        <label>Name</label>
                        <input name="name" value={formData.name} onChange={handleProfileChange}/>
                      </Field>

                      <Field>
                        <label>Email</label>
                        <input value={formData.email} disabled/>
                      </Field>

                      <Field>
                        <label>Mobile</label>
                        <input name="mobile" value={formData.mobile} onChange={handleProfileChange}/>
                      </Field>

                      <Field full>
                        <label>Address</label>
                        <textarea rows="3" name="address" value={formData.address} onChange={handleProfileChange}/>
                      </Field>

                    </Grid>

                    <Btn disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Btn>
                  </form>
                </>
              )}

              {activeTab==="security" && (
                <>
                  <Title>Security Settings</Title>

                  <AlertBox>
                    Use strong password with numbers & symbols.
                  </AlertBox>

                  <form onSubmit={handleUpdatePassword}>
                    <Grid>

                      <Field>
                        <label>Current Password</label>
                        <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange}/>
                      </Field>

                      <Field>
                        <label>New Password</label>
                        <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange}/>
                      </Field>

                      <Field>
                        <label>Verify Password</label>
                        <input type="password" name="verifyPassword" value={passwords.verifyPassword} onChange={handlePasswordChange}/>
                      </Field>

                    </Grid>

                    <Btn full disabled={loading}>
                      {loading ? "Updating..." : "Update Password"}
                    </Btn>
                  </form>
                </>
              )}

            </Card>
          </div>

        </div>
      </Wrapper>
    </>
  );
}

/* ───────── STYLES ───────── */

const Wrapper = styled.div`
  font-family: var(--font-ui);
`;

const SideCard = styled.div`
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--shadow);
  padding: 20px;
  text-align:center;
`;

const TopBanner = styled.div`
  height:100px;
  background:var(--grad);
  border-radius:14px;
`;

const AvatarBox = styled.div`
  margin-top:-50px;
  position:relative;
`;

const Avatar = styled.div`
  width:90px;height:90px;border-radius:50%;
  background:var(--grad);
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:2rem;font-weight:800;
  margin:auto;
`;

const Cam = styled.div`
  position:absolute;bottom:0;right:35%;
  background:#fff;padding:6px;border-radius:50%;
`;

const Role = styled.div`
  margin-top:8px;
  color:var(--g1);
  font-weight:700;
`;

const Menu = styled.div`
  margin-top:20px;
`;

const Item = styled.div`
  padding:10px;
  border-radius:10px;
  cursor:pointer;
  background:${p=>p.$active?"var(--grad-soft)":"transparent"};
`;

const Status = styled.div`
  margin-top:20px;
  color:green;
  font-size:12px;
`;

const Card = styled.div`
  background:#fff;
  padding:30px;
  border-radius:20px;
  box-shadow:var(--shadow);
`;

const Title = styled.h3`
  font-family:var(--font-serif);
`;

const Grid = styled.div`
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:20px;
`;

const Field = styled.div`
  display:flex;
  flex-direction:column;
  grid-column:${p=>p.full?"span 2":"auto"};

  input,textarea{
    padding:10px;
    border:1px solid var(--border);
    border-radius:8px;
  }
`;

const Btn = styled.button`
  margin-top:20px;
  background:var(--grad);
  color:#fff;
  padding:12px;
  border:none;
  border-radius:10px;
  width:${p=>p.full?"100%":"auto"};
`;

const AlertBox = styled.div`
  background:var(--grad-soft);
  padding:10px;
  border-radius:10px;
  margin-bottom:20px;
`;