import styled from "styled-components";

/* ================= CONSTANTS ================= */
export const HEADER_HEIGHT = 64;
export const SIDEBAR_WIDTH = 260;

/* ================= COLORS ================= */
export const colors = {
  header: "linear-gradient(135deg, #064e3b, #1f2937)",
  sidebar: "linear-gradient(180deg, #0f172a, #065f46)",
  contentBg: "#f8fafc",
  cardBg: "#ffffff",

  accent: "#22c55e",
  accentAmber: "#84cc16",
  danger: "#dc2626",

  textLight: "#ecfdf5",
  textDark: "#0f172a"
};

/* ================= ROOT ================= */
export const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

/* ================= HEADER ================= */
export const Header = styled.header`
  height: ${HEADER_HEIGHT}px;
  background: ${colors.header};
  color: ${colors.textLight};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 300;

  /* Hide hamburger on desktop */
  .hamburger {
    display: none;
    font-size: 20px;
    cursor: pointer;
  }

  /* Show hamburger only on mobile */
  @media (max-width: 768px) {
    .hamburger {
      display: block;
    }
  }
`;

/* ================= HEADER BRAND ================= */
export const HeaderBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .brand-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    box-shadow: 0 6px 16px rgba(34, 197, 94, 0.45);
  }

  .brand-icon svg {
    font-size: 18px;
    color: #ecfdf5;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .brand-title {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #ecfdf5;
  }

  .brand-subtitle {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.6px;
    color: #a7f3d0;
  }
`;

/* ================= MAIN ================= */
export const Main = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
`;

/* ================= SIDEBAR ================= */
export const Sidebar = styled.aside`
  width: ${SIDEBAR_WIDTH}px;
  background: ${colors.sidebar};
  color: ${colors.textLight};
  display: flex;
  flex-direction: column;
  z-index: 250;

  @media (max-width: 768px) {
    position: absolute;
    top: 0;
    bottom: 0;
    left: ${({ open }) => (open ? "0" : `-${SIDEBAR_WIDTH}px`)};
    transition: left 0.3s ease;
  }
`;

/* ================= SIDEBAR BRAND ================= */
export const SidebarBrand = styled.div`
  padding: 20px 16px;
  text-align: center;
  background: linear-gradient(
    180deg,
    rgba(16, 185, 129, 0.35),
    rgba(6, 95, 70, 0.25)
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);

  .brand-icon {
    width: 46px;
    height: 46px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    box-shadow: 0 6px 16px rgba(34, 197, 94, 0.45);

    svg {
      font-size: 20px;
      color: #ecfdf5;
    }
  }

  .brand-title {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #ecfdf5;
    margin-bottom: 2px;
  }

  .brand-subtitle {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.6px;
    color: #a7f3d0;
    line-height: 1.4;
  }
`;

/* ================= OVERLAY ================= */
export const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${({ show }) => (show ? "block" : "none")};
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 200;
  }
`;

/* ================= SIDEBAR MENU ================= */
export const SidebarMenu = styled.div`
  flex: 1;
  overflow-y: auto;

  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

/* ================= FOOTER ================= */
export const SidebarFooter = styled.div`
  height: 44px;
  background: rgba(255, 255, 255, 0.06);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
`;

/* ================= CONTENT ================= */
export const Content = styled.main`
  flex: 1;
  background: ${colors.contentBg};
  padding: 20px;
  overflow-y: auto;

  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

/* ================= MENU ================= */
export const MenuItem = styled.div`
  padding: 14px 18px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.25s ease;

  &:hover {
    background: linear-gradient(
      90deg,
      rgba(34, 197, 94, 0.35),
      rgba(31, 41, 55, 0.15)
    );
    color: ${colors.accent};
  }
`;

export const MenuLeft = styled.span`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SubMenu = styled.div`
  padding-left: 36px;
  display: ${({ open }) => (open ? "block" : "none")};
`;

export const SubMenuItem = styled(MenuItem)`
  font-size: 14px;
`;

/* ================= BREADCRUMB ================= */
export const Breadcrumb = styled.div`
  background: ${colors.cardBg};
  padding: 16px 20px;
  border-radius: 14px;
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
`;

/* ================= DROPDOWN ================= */
export const Dropdown = styled.div`
  position: relative;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  right: 0;
  top: 48px;
  width: 220px;
  background: ${colors.cardBg};
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: ${({ open }) => (open ? "block" : "none")};
  z-index: 999;
`;

/* ================= DROPDOWN ITEMS ================= */
export const ProfileItem = styled.div`
  padding: 14px 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: ${colors.textDark};

  svg {
    color: ${colors.accent};
  }

  &:hover {
    background: rgba(16, 185, 129, 0.15);
  }
`;

export const PasswordItem = styled(ProfileItem)`
  svg {
    color: ${colors.accentAmber};
  }
`;

export const LogoutItem = styled(ProfileItem)`
  svg {
    color: ${colors.danger};
  }

  &:hover {
    background: rgba(220, 38, 38, 0.15);
  }
`;

/* ================= EXTRA COMPONENTS (NO INLINE CSS) ================= */
export const BigGraphBox = styled.div`
  height: 600px;
  background: linear-gradient(135deg, #e0f2fe, #bae6fd);
  border-radius: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: #0369a1;
`;

export const DummyCard = styled.div`
  height: 220px;
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);

  h3 {
    margin-bottom: 10px;
  }

  p {
    margin: 0;
  }
`;