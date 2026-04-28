import { useState } from "react";
import { Outlet, NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import NotificationBell from "./NotificationBell";
import alert from "../../../Services/SweetAlert";

// ─── Global Styles & Fonts ───────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

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
    --sw: 264px;
    --nh: 72px;
    --r1: 8px; --r2: 12px; --r3: 18px; --r4: 24px;
    --shadow-sm: 0 2px 12px rgba(20,5,60,0.07);
    --shadow-md: 0 6px 28px rgba(20,5,60,0.09);
    --shadow-lg: 0 16px 56px rgba(20,5,60,0.13);
    --font-ui:      'Outfit', sans-serif;
    --font-serif:   'Instrument Serif', serif;
  }
`;

const fadeUp   = keyframes`from{opacity:0;transform:translateY(-7px)}to{opacity:1;transform:translateY(0)}`;
const slideIn  = keyframes`from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}`;
const gradAnim = keyframes`0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}`;

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminMasterPage() {
  const navigate = useNavigate();

  const userName  = localStorage.getItem("userName")  || "Admin User";
  const userRole  = localStorage.getItem("userRole")  || "Admin";
  const userEmail = localStorage.getItem("userEmail") || "admin@octanefitcity.com";

  const handleLogout = () => {
    localStorage.clear();
    alert.toast("Logged out successfully");
    navigate("/login");
  };

  const [sidebarOpen,        setSidebarOpen]        = useState(false);
  const [ofcManageDropdown,  setOfcManageDropdown]  = useState(false);
  const [wellnessDropdown,   setWellnessDropdown]   = useState(false);
  const [membershipDropdown, setMembershipDropdown] = useState(false);
  const [memberDropdown,     setMemberDropdown]     = useState(false);
  const [billingDropdown,    setBillingDropdown]    = useState(false);
  const [reportsDropdown,    setReportsDropdown]    = useState(false);
  const [levelDropdown,      setLevelDropdown]      = useState(false);
  const [eventDropdown,      setEventDropdown]      = useState(false);
  const [configurationsDropdown, setconfigurations] = useState(false);

  const location  = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  const titleMap = {
    admin: "Home", dashboard: "Dashboard", members: "Members",
    list: "Member List", add: "Add Member", trainers: "Trainers",
    payments: "Payments", "user-membership": "User Membership",
  };

  const currentTitle = titleMap[pathnames[pathnames.length - 1]] || "Octane Fit City";
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const navGroups = [
    {
      label: "General",
      items: [
        { icon: "bi-speedometer2",    label: "Overview",  to: "/admin/dashboard", direct: true },
        { icon: "bi-question-circle", label: "Inquiries", to: "/admin/inquires",  direct: true },
      ],
    },
    {
      label: "Management",
      items: [
        {
          icon: "bi-building", label: "OFC Manage",
          state: ofcManageDropdown, toggle: () => setOfcManageDropdown(!ofcManageDropdown),
          children: [
            { label: "Admin",   to: "/Admin/admin"   },
            { label: "Trainer", to: "/admin/trainer" },
          ],
        },
        {
          icon: "bi-heart-pulse", label: "Wellness Center",
          state: wellnessDropdown, toggle: () => setWellnessDropdown(!wellnessDropdown),
          children: [
            { label: "Appointment", to: "/admin/appointment" },
            { label: "Packages",    to: "/admin/Package"     },
            { label: "Services",    to: "/admin/Service"     },
          ],
        },
        {
          icon: "bi-card-checklist", label: "OFC Membership",
          state: membershipDropdown, toggle: () => setMembershipDropdown(!membershipDropdown),
          children: [
            { label: "Membership Packages",  to: "/admin/membership-packages" },
            { label: "User Membership",      to: "/admin/user-membership"     },
            { label: "Add Membership",       to: "/admin/AddUserMembership"   },
            { label: "Expiring Memberships", to: "/admin/expiringmembership"  },
          ],
        },
        {
          icon: "bi-card-checklist", label: "Configurations",
          state: configurationsDropdown, toggle: () => setconfigurations(!configurationsDropdown),
          children: [
            { label: "Financial Year", to: "/admin/financialYear" },
          ],
        },   
        {
          icon: "bi-people", label: "OFC Members",
          state: memberDropdown, toggle: () => setMemberDropdown(!memberDropdown),
          children: [{ label: "Member List", to: "/Admin/Members" }],
        },
      ],
    },
    {
      label: "Finance",
      items: [
        {
          icon: "bi-receipt", label: "Billing",
          state: billingDropdown, toggle: () => setBillingDropdown(!billingDropdown),
          children: [
            { label: "Invoices", to: "/admin/invoices" },
            { label: "Payments", to: "/admin/payments" },
          ],
        },
        {
          icon: "bi-graph-up", label: "Reports",
          state: reportsDropdown, toggle: () => setReportsDropdown(!reportsDropdown),
          children: [
            { label: "Sales Register", to: "/admin/sales-register" },
            { label: "Cash Report",    to: "/admin/cash-report"    },
            { label: "GST Report",     to: "/admin/gst-report"     },
          ],
        },
      ],
    },
    {
      label: "Fitness",
      items: [
        {
          iconClass: "fas fa-dumbbell", label: "Level & Equipment",
          state: levelDropdown, toggle: () => setLevelDropdown(!levelDropdown),
          children: [
            { label: "Level List",     to: "/admin/level-list"     },
            { label: "Fitness Goal",   to: "/admin/fitness-goal"   },
            { label: "Equipment List", to: "/admin/equipment-list" },
          ],
        },
        {
          iconClass: "fa fa-calendar", label: "Event Management",
          state: eventDropdown, toggle: () => setEventDropdown(!eventDropdown),
          children: [
            { label: "Event List", to: "/admin/event-list" },
            { label: "Add Event",  to: "/admin/add-event"  },
          ],
        },
      ],
    },
  ];

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <>
      <GlobalStyle />
      <Shell>

        {/* ═══ NAVBAR ═══════════════════════════════════════════════════════ */}
        <Navbar>
          <NLeft>
            <BurgerBtn onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="menu">
              <span /><span /><span />
            </BurgerBtn>
            <Brand>
              <LogoBox>
                <img src="/images-removebg-preview.png" alt="Octane" />
              </LogoBox>
              <BrandText>
                <BrandName>OCTANE <Accent>FIT CITY</Accent></BrandName>
                <BrandTagline>Fitter · Healthier · Happier</BrandTagline>
              </BrandText>
            </Brand>
          </NLeft>

          {/* Centre chip — live date + panel label */}
          <NavChip className="d-none d-lg-flex">
            <ChipDot />
            <ChipLabel>Admin Panel</ChipLabel>
            <ChipRule />
            <ChipDate>{todayLabel}</ChipDate>
          </NavChip>

          <NRight>
            <NotificationBell />
            <div className="dropdown">
              <AvatarTrigger className="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <AvatarCircle>{initials}</AvatarCircle>
                <AvatarInfo className="d-none d-sm-block">
                  <span className="name">{userName}</span>
                  {/* <span className="role">{userRole}</span> */}
                </AvatarInfo>
                <i className="bi bi-chevron-down" style={{ fontSize: "0.65rem", color: "var(--tm)" }} />
              </AvatarTrigger>

              <DropdownMenu className="dropdown-menu dropdown-menu-end">
                <DropBanner />
                <DropContent>
                  <DropAvatar>{initials}</DropAvatar>
                  <DropUserName>{userName}</DropUserName>
                  <DropUserEmail>{userEmail}</DropUserEmail>
                  <GradBadge>{userRole}</GradBadge>
                </DropContent>
                <DropActions>
                  <Link className="dropdown-item" to="/admin/profile">
                    <i className="bi bi-person-circle" /><span>My Profile</span>
                  </Link>
                  <Link className="dropdown-item" to="/admin/security">
                    <i className="bi bi-shield-check" /><span>Security</span>
                  </Link>
                  <DropDivider />
                  <button className="dropdown-item signout" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right" /><span>Sign Out</span>
                  </button>
                </DropActions>
              </DropdownMenu>
            </div>
          </NRight>
        </Navbar>

        {/* ═══ SIDEBAR ══════════════════════════════════════════════════════ */}
        <Sidebar className={sidebarOpen ? "open" : ""}>
          <SideBody>
            {navGroups.map((grp, gi) => (
              <SectionGroup key={gi}>
                <SectionTitle>{grp.label}</SectionTitle>
                {grp.items.map((item, ii) => (
                  <NavItem key={ii}>
                    {item.direct ? (
                      <DirectLink to={item.to} onClick={() => setSidebarOpen(false)}>
                        <NavIcon>
                          {item.iconClass ? <i className={item.iconClass} /> : <i className={`bi ${item.icon}`} />}
                        </NavIcon>
                        <NavLabel>{item.label}</NavLabel>
                      </DirectLink>
                    ) : (
                      <>
                        <AccordionTrigger onClick={item.toggle} $open={item.state}>
                          <NavIcon $active={item.state}>
                            {item.iconClass ? <i className={item.iconClass} /> : <i className={`bi ${item.icon}`} />}
                          </NavIcon>
                          <NavLabel>{item.label}</NavLabel>
                          <ChevIcon className={`bi bi-chevron-${item.state ? "up" : "down"}`} />
                        </AccordionTrigger>
                        {item.state && (
                          <SubMenu>
                            {item.children.map((c, ci) => (
                              <li key={ci}>
                                <SubLink
                                  as={NavLink}
                                  to={c.to}
                                  onClick={() => setSidebarOpen(false)}
                                  className={({ isActive }) => isActive ? "active" : ""}
                                >
                                  <Dot />{c.label}
                                </SubLink>
                              </li>
                            ))}
                          </SubMenu>
                        )}
                      </>
                    )}
                  </NavItem>
                ))}
              </SectionGroup>
            ))}
          </SideBody>
          <SideFooter>
            <FooterRule />
            <FooterNote>© 2026 Octane Fit City</FooterNote>
          </SideFooter>
        </Sidebar>

        {sidebarOpen && <Overlay onClick={() => setSidebarOpen(false)} />}

        {/* ═══ CONTENT ══════════════════════════════════════════════════════ */}
        <ContentArea>
          <PageHeader>
            <PHLeft>
              <PageTitle>{currentTitle}</PageTitle>
              <PHDivider />
              <PageSub>Octane Fit City</PageSub>
            </PHLeft>
            <Breadcrumb>
              <BCItem>
                <Link to="/admin/dashboard"><i className="bi bi-house-fill" /> Home</Link>
              </BCItem>
              {pathnames.map((v, i) => {
                const last  = i === pathnames.length - 1;
                const to    = `/${pathnames.slice(0, i + 1).join("/")}`;
                const label = titleMap[v] || v.replace(/-/g, " ");
                return last ? (
                  <BCItem key={to} $last>
                    <BCSep>/</BCSep><span>{label}</span>
                  </BCItem>
                ) : (
                  <BCItem key={to}>
                    <BCSep>/</BCSep><Link to={to}>{label}</Link>
                  </BCItem>
                );
              })}
            </Breadcrumb>
          </PageHeader>

          <ContentScroll>
            <Outlet />
          </ContentScroll>
        </ContentArea>

      </Shell>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Styled Components
// ────────────────────────────────────────────────────────────────────────────

const Shell = styled.div`
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
  font-family: var(--font-ui);
  color: var(--tb);
`;

/* ── Navbar ─────────────────────────────────────────────────────────────── */
const Navbar = styled.nav`
  height: var(--nh);
  background: var(--white);
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 1100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid var(--border);
  /* layered shadow gives more depth */
  box-shadow: 0 1px 0 var(--border2), 0 4px 24px rgba(20,5,60,0.06);

  @media (max-width: 768px) { padding: 0 14px; }
`;

const NLeft  = styled.div`display:flex;align-items:center;gap:14px;`;
const NRight = styled.div`display:flex;align-items:center;gap:10px;`;

/* Centre chip */
const NavChip = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 9px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 40px;
  padding: 5px 16px 5px 10px;
`;

const ChipDot = styled.span`
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--grad);
  background-size: 200% 200%;
  animation: ${gradAnim} 3s ease infinite;
  flex-shrink: 0;
`;

const ChipLabel = styled.span`
  font-family: var(--font-ui);
  font-size: 0.7rem; font-weight: 800;
  letter-spacing: 1px; text-transform: uppercase;
  background: var(--grad);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
`;

const ChipRule = styled.span`width:1px;height:12px;background:var(--border2);`;

const ChipDate = styled.span`
  font-family: var(--font-ui);
  font-size: 0.7rem; font-weight: 500; color: var(--tm);
`;

/* Burger */
const BurgerBtn = styled.button`
  display: none;
  flex-direction: column; justify-content: center; gap: 5px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--r1); width: 38px; height: 38px;
  padding: 7px 8px; cursor: pointer; transition: 0.2s;

  span { display:block; width:100%; height:2px; background:var(--tm); border-radius:2px; transition:0.2s; }
  &:hover { border-color:var(--border2); span { background:var(--tb); } }
  @media (max-width: 992px) { display: flex; }
`;

/* Brand */
const Brand = styled.div`display:flex;align-items:center;gap:12px;`;

const LogoBox = styled.div`
  width: 42px; height: 42px;
  border-radius: 10px;
  background: var(--grad);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 18px rgba(255,74,110,0.40);
  flex-shrink: 0;
  img { width:44px; height:44px; object-fit:contain; filter:brightness(0) invert(1); }
`;

const BrandText = styled.div`display:flex;flex-direction:column;gap:2px;`;

const BrandName = styled.h1`
  font-family: var(--font-ui);
  font-size: 1rem; font-weight: 900;
  color: var(--th); text-transform: uppercase;
  letter-spacing: 1.8px; line-height: 1; margin: 0;
`;

const Accent = styled.span`
  background: var(--grad);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
`;

/* Italic serif tagline under brand name */
const BrandTagline = styled.p`
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.67rem;
  color: var(--tm);
  margin: 0;
  letter-spacing: 0.3px;
`;

/* Avatar */
const AvatarTrigger = styled.button`
  display: flex; align-items: center; gap: 9px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 40px; padding: 4px 12px 4px 4px;
  cursor: pointer; transition: 0.2s;
  &::after { display:none !important; }
  &:hover { border-color:var(--border2); box-shadow:0 3px 14px rgba(255,74,110,0.13); }
`;

const AvatarCircle = styled.div`
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--grad); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-ui); font-weight: 800; font-size: 0.7rem; letter-spacing: 0.5px;
  flex-shrink: 0; box-shadow: 0 3px 12px rgba(255,74,110,0.38);
`;

const AvatarInfo = styled.div`
  display: flex; flex-direction: column; text-align: left;
  .name { font-family:var(--font-ui); font-size:0.82rem; font-weight:700; color:var(--th); line-height:1.2; text-transform:capitalize; }
  .role { font-family:var(--font-ui); font-size:0.62rem; color:var(--tm); text-transform:uppercase; letter-spacing:0.8px; font-weight:700; }
`;

/* Dropdown */
const DropdownMenu = styled.ul`
  min-width: 240px !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--r3) !important;
  box-shadow: var(--shadow-lg) !important;
  padding: 0 !important; margin-top: 10px !important;
  overflow: hidden; list-style: none;
  animation: ${fadeUp} 0.18s ease;
`;

const DropBanner = styled.div`
  height: 4px;
  background: var(--grad);
  background-size: 300% 300%;
  animation: ${gradAnim} 4s ease infinite;
`;

const DropContent = styled.div`
  padding: 22px 20px 16px; text-align: center; background: var(--white);
`;

const DropAvatar = styled.div`
  width: 54px; height: 54px; border-radius: 14px;
  background: var(--grad); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-ui); font-weight: 800; font-size: 1.1rem; letter-spacing: 0.5px;
  margin: 0 auto 12px; box-shadow: 0 6px 22px rgba(255,74,110,0.40);
`;

const DropUserName = styled.p`
  font-family: var(--font-ui); font-size:0.92rem; font-weight:700;
  color:var(--th); text-transform:capitalize; margin:0 0 3px;
`;

const DropUserEmail = styled.p`
  font-family: var(--font-ui); font-size:0.72rem; color:var(--tm); margin:0 0 10px;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
`;

const GradBadge = styled.span`
  display: inline-block; background: var(--grad); color: #fff;
  font-family: var(--font-ui); font-size:0.6rem; font-weight:800;
  text-transform:uppercase; letter-spacing:1px; padding:3px 11px; border-radius:20px;
`;

const DropActions = styled.div`
  padding: 6px 8px 10px; border-top: 1px solid var(--border); background: var(--white);
  .dropdown-item {
    display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:var(--r1);
    font-family:var(--font-ui); font-size:0.855rem; font-weight:500;
    color:var(--tb); text-decoration:none; background:none; border:none; width:100%; cursor:pointer;
    transition:background 0.15s, color 0.15s;
    i { font-size:1rem; color:var(--tm); transition:0.15s; }
    &:hover { background:var(--grad-soft); color:var(--g1); i { color:var(--g1); } }
    &.signout { color:#e53e3e; i{color:#fc8181;} &:hover{background:#fff5f5;color:#c53030;i{color:#e53e3e;}} }
  }
`;

const DropDivider = styled.hr`border-color:var(--border);margin:4px 0;`;

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
const Sidebar = styled.aside`
  width: var(--sw);
  background: var(--white);
  position: fixed; top: var(--nh); bottom: 0; left: 0;
  z-index: 1000; display: flex; flex-direction: column;
  border-right: 1px solid var(--border);
  box-shadow: 2px 0 20px rgba(20,5,60,0.04);
  transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);

  @media (max-width: 992px) {
    transform: translateX(-100%);
    &.open { transform: translateX(0); }
  }
`;

const SideBody = styled.div`
  flex:1; overflow-y:auto; padding:16px 10px 8px;
  &::-webkit-scrollbar { width:3px; }
  &::-webkit-scrollbar-thumb { background:var(--border); border-radius:8px; }
`;

const SectionGroup = styled.div`margin-bottom:20px;`;

const SectionTitle = styled.p`
  font-family: var(--font-ui);
  font-size:0.62rem; font-weight:800;
  text-transform:uppercase; letter-spacing:1.4px;
  color:var(--tm); opacity:0.7; margin:0 0 6px 10px;
`;

const NavItem = styled.div`margin-bottom:2px;`;

const NavIcon = styled.span`
  width:30px; height:30px; border-radius:var(--r1);
  display:flex; align-items:center; justify-content:center;
  font-size:0.88rem; flex-shrink:0; transition:background 0.18s,color 0.18s;
  background:${({$active}) => $active ? "var(--grad-soft)" : "var(--bg)"};
  color:${({$active}) => $active ? "var(--g1)" : "var(--tm)"};
`;

const NavLabel = styled.span`flex:1; font-family:var(--font-ui);`;

const rowBase = `
  display:flex; align-items:center; gap:10px;
  width:100%; padding:7px 10px; border-radius:var(--r1);
  font-family:var(--font-ui); font-size:0.855rem; font-weight:600;
  text-decoration:none; border:none; background:transparent; cursor:pointer;
  transition:background 0.18s,color 0.18s; color:var(--tb); position:relative;
`;

const DirectLink = styled(NavLink)`
  ${rowBase}
  &:hover { background:var(--grad-hover); color:var(--g1); ${NavIcon}{background:var(--grad-soft);color:var(--g1);} }
  &.active {
    background:var(--grad-soft); color:var(--g1);
    &::before { content:''; position:absolute; left:0; top:20%; bottom:20%; width:3px; background:var(--grad); border-radius:0 3px 3px 0; }
    ${NavIcon}{background:var(--grad-soft);color:var(--g1);}
  }
`;

const AccordionTrigger = styled.div`
  ${rowBase} justify-content:space-between;
  background:${({$open}) => $open ? "var(--grad-soft)" : "transparent"};
  color:${({$open}) => $open ? "var(--g1)" : "var(--tb)"};
  &:hover { background:var(--grad-hover); color:var(--g1); }
`;

const ChevIcon = styled.i`font-size:0.68rem;color:var(--tm);`;

const SubMenu = styled.ul`
  list-style:none; padding:4px 0 6px; margin:0;
  animation:${slideIn} 0.16s ease;
`;

const Dot = styled.span`
  width:5px; height:5px; border-radius:50%;
  background:currentColor; opacity:0.4; flex-shrink:0; transition:opacity 0.15s;
`;

const SubLink = styled.a`
  display:flex; align-items:center; gap:8px;
  padding:7px 10px 7px 50px;
  font-family:var(--font-ui); font-size:0.82rem; font-weight:500;
  color:var(--tm); text-decoration:none; border-radius:var(--r1);
  transition:color 0.15s,background 0.15s;
  &:hover { color:var(--g1); background:var(--grad-soft); ${Dot}{opacity:1;} }
  &.active { color:var(--g1); font-weight:700; ${Dot}{opacity:1;} }
`;

const SideFooter = styled.div`padding:0 10px 14px;`;
const FooterRule = styled.div`height:1px;background:var(--border);margin-bottom:12px;`;
const FooterNote = styled.p`font-family:var(--font-ui);font-size:0.66rem;color:var(--tm);text-align:center;font-weight:600;`;

const Overlay = styled.div`
  position:fixed; inset:0;
  background:rgba(10,5,35,0.50);
  z-index:950; backdrop-filter:blur(3px);
`;

/* ── Content ─────────────────────────────────────────────────────────────── */
const ContentArea = styled.main`
  margin-left: var(--sw);
  margin-top: var(--nh);
  height: calc(100vh - var(--nh));
  display: flex; flex-direction: column;
  @media (max-width: 992px) { margin-left: 0; }
`;

/* Page header — professional redesign */
const PageHeader = styled.div`
  padding: 0 28px;
  height: 68px;
  background: var(--white);
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--border);
  box-shadow: 0 2px 16px rgba(20,5,60,0.05);
  flex-shrink: 0;
  position: relative;

  /* gradient left-accent bar */
  &::before {
    content: '';
    position: absolute; left: 0; top: 18%; bottom: 18%;
    width: 3px; background: var(--grad); border-radius: 0 3px 3px 0;
  }

  @media (max-width: 768px) { padding:12px 14px 12px 18px; height:auto; flex-wrap:wrap; gap:6px; }
`;

const PHLeft = styled.div`
  display: flex; align-items: baseline; gap: 12px;
`;

/* Italic serif display title — editorial, premium feel */
const PageTitle = styled.h2`
  font-family: var(--font-serif);
  font-size: 1.5rem; font-weight: 400; font-style: italic;
  background: var(--grad);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  margin: 0; text-transform: capitalize; letter-spacing: 0.2px; line-height: 1;
`;

/* Thin vertical rule between title and sub-label */
const PHDivider = styled.span`
  display: inline-block;
  width: 1px; height: 18px; align-self: center;
  background: var(--border2); flex-shrink: 0;
`;

const PageSub = styled.p`
  font-family: var(--font-ui);
  font-size: 0.68rem; color: var(--tm); font-weight: 500; margin: 0;
`;

const Breadcrumb = styled.ol`display:flex;align-items:center;list-style:none;margin:0;padding:0;`;

const BCItem = styled.li`
  display:flex; align-items:center;
  font-family:var(--font-ui); font-size:0.76rem;
  a { color:${({$last}) => $last?"var(--th)":"var(--tm)"}; font-weight:${({$last}) => $last?700:500}; text-decoration:none; text-transform:capitalize; transition:0.15s; &:hover{color:var(--g1);} i{margin-right:4px;} }
  span { color:var(--th); font-weight:700; text-transform:capitalize; }
`;

const BCSep = styled.span`color:var(--border2);margin:0 5px;font-weight:300;`;

const ContentScroll = styled.div`
  flex:1; overflow-y:auto; padding:26px 28px; background:var(--bg);
  &::-webkit-scrollbar { width:4px; }
  &::-webkit-scrollbar-thumb { background:var(--border); border-radius:8px; }
  @media (max-width: 768px) { padding:14px; }
`;