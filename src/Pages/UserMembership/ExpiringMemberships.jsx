import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";

export default function ExpiringMemberships() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchExpiringMemberships();
  }, []);

  const fetchExpiringMemberships = async () => {
    try {
      const res = await apiRequest.get("/usermembership/expiring");
      if (res.status === "success") {
        setMemberships(res.data || []);
      }
    } catch (error) {
      console.error("API Error:", error);
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateRemainingDays = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  };

  // Helper for styling based on urgency
  const getUrgencyDetails = (days) => {
    if (days <= 3) return { type: "critical", text: "Critical" };
    if (days <= 7) return { type: "urgent", text: "Urgent" };
    return { type: "upcoming", text: "Upcoming" };
  };

  const filteredMemberships = useMemo(() => {
    return memberships.filter(m =>
      m.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.member?.mobile?.includes(searchTerm)
    );
  }, [searchTerm, memberships]);

  const handleWhatsApp = (data) => {
    const remainingDays = calculateRemainingDays(data.end_at);
    if (remainingDays < 0) {
      alert.error("Membership already expired");
      return;
    }

    const message = `*OCTANE GYM*
----------------------------
Dear *${data.member?.name || "Member"}*,

Your *${data.membershipPackage?.name || "Gym"}* membership expires in *${remainingDays} day(s)*.

📅 Expiry Date: ${data.end_at?.substring(0, 10)}

Please renew to keep your gains! 💪

_Octane Gym Team_`;
    const phone = data.member?.mobile?.replace(/\D/g, "");
    window.open(`https://web.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) {
    return (
      <Container>
        <LoaderContainer>
          <Spinner />
        </LoaderContainer>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header Section */}
      <HeaderSection>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <PageTitle>
            Memberships <span>/ Expiring</span>
          </PageTitle>
          <Sub>Review members expiring in the next 30 days</Sub>
        </div>
        <HeaderActions>
          <InputWrapper>
            <i className="bi bi-search" />
            <Input
              type="text"
              placeholder="Search name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputWrapper>
        </HeaderActions>
      </HeaderSection>

      {/* Stats Summary */}
      <StatsGrid>
        <StatCard>
          <CardLeft>
            <Label>Total Expiring</Label>
            <Value>{memberships.length}</Value>
          </CardLeft>
          <IconBox><i className="bi bi-hourglass-split" /></IconBox>
        </StatCard>
      </StatsGrid>

      {/* Table Section */}
      <TableCard>
        {!filteredMemberships.length ? (
          <EmptyState>
            <div className="icon-box">
              <i className="bi bi-check-circle-fill text-success" style={{ color: "#16a34a" }} />
            </div>
            <h6>All Clear!</h6>
            <p>No memberships matching your criteria.</p>
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <th className="ps-4" width="300">Member Info</th>
                <th>Membership</th>
                <th>Expiry Date</th>
                <th width="150" className="text-center">Status</th>
                <th width="150" className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMemberships.map((item) => {
                const days = calculateRemainingDays(item.end_at);
                const urgency = getUrgencyDetails(days);

                return (
                  <tr key={item.id}>
                    <td className="ps-4">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {/* 👇 PURAANA CODE HATA KAR YE NAYA CODE DAALEIN 👇 */}
                        <AvatarBox>
                          {item.member?.profile_image ? (
                            <ProfileImg
                              src={`${API_BASE_URL}${item.member.profile_image.replace(/\\/g, "/")}`}
                              alt={item.member?.name}
                            />
                          ) : (
                            item.member?.name?.charAt(0).toUpperCase() || "?"
                          )}
                        </AvatarBox>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <MemberName>{item.member?.name}</MemberName>
                          <ContactInfo>{item.member?.mobile}</ContactInfo>
                        </div>
                      </div>
                    </td>
                    <td>
                      <PackageBadge>{item.membershipPackage?.name}</PackageBadge>
                    </td>
                    <td>
                      <DateText>{new Date(item.end_at).toLocaleDateString()}</DateText>
                    </td>
                    <td className="text-center">
                      <UrgencyBadge $type={urgency.type}>
                        {days} Days ({urgency.text})
                      </UrgencyBadge>
                    </td>
                    <td className="text-center">
                      <WhatsAppBtn onClick={() => handleWhatsApp(item)}>
                        <i className="fa-brands fa-whatsapp"></i>
                        Remind
                      </WhatsAppBtn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </TableCard>
    </Container>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Styled Components matched to AdminMasterPage Theme
// ────────────────────────────────────────────────────────────────────────────

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeUp 0.3s ease-in-out;

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid var(--border2);
  border-top: 4px solid var(--g1);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const PageTitle = styled.h3`
  font-family: var(--font-ui);
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--th);
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;

  span {
    font-family: var(--font-serif);
    font-style: italic;
    font-weight: 400;
    font-size: 1.4rem;
    color: var(--tm);
  }
`;

const Sub = styled.p`
  font-family: var(--font-ui);
  font-size: 0.8rem;
  color: var(--tm);
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const InputWrapper = styled.div`
  position: relative;
  min-width: 280px;
  i {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--tm);
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  width: 100%;
  font-family: var(--font-ui);
  font-size: 0.85rem;
  color: var(--tb);
  background: var(--white);
  border: 1px solid var(--border2);
  border-radius: var(--r1);
  padding: 10px 14px 10px 36px;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);

  &:focus {
    border-color: var(--g2);
    box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media(max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media(max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;

  /* Left accent border */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--grad);
  }
`;

const CardLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.p`
  font-family: var(--font-ui);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--tm);
  margin: 0;
`;

const Value = styled.h3`
  font-family: var(--font-ui);
  font-size: 1.4rem;
  margin: 0;
  font-weight: 800;
  color: var(--th);
  letter-spacing: -0.5px;
`;

const IconBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--r1);
  background: var(--grad-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--g1);
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const TableCard = styled.div`
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
  
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;

  th {
    background: var(--bg);
    font-family: var(--font-ui);
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--tm);
    letter-spacing: 0.5px;
    padding: 14px 16px;
    border-bottom: 2px solid var(--border);
    white-space: nowrap;
    
    &.text-center { text-align: center; }
    &.ps-4 { padding-left: 24px; }
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    font-family: var(--font-ui);
    color: var(--tb);
    vertical-align: middle;

    &.text-center { text-align: center; }
    &.ps-4 { padding-left: 24px; }
  }

  tbody tr {
    transition: background 0.15s;
    &:hover { background: var(--bg); }
    &:last-child td { border-bottom: none; }
  }
`;
// 👇 NAYA STYLED COMPONENT
const ProfileImg = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;
const AvatarBox = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--grad);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(255, 74, 110, 0.3);
`;

const MemberName = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--th);
  text-transform: capitalize;
`;

const ContactInfo = styled.div`
  font-size: 0.75rem;
  color: var(--tm);
`;

const PackageBadge = styled.span`
  display: inline-flex;
  padding: 6px 12px;
  background: var(--bg);
  border: 1px solid var(--border2);
  color: var(--tb);
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: var(--r1);
`;

const DateText = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--tb);
`;

const UrgencyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;

  ${({ $type }) => {
    switch ($type) {
      case "critical":
        return "background: #fee2e2; color: #dc2626;";
      case "urgent":
        return "background: #fef3c7; color: #d97706;";
      case "upcoming":
        return "background: #e0f2fe; color: #0284c7;";
      default:
        return "background: var(--bg); color: var(--tm); border: 1px solid var(--border2);";
    }
  }}
`;

const WhatsAppBtn = styled.button`
  background: #10b981;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  font-family: var(--font-ui);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

  &:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  }
  
  i {
    font-size: 0.9rem;
  }
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  
  .icon-box {
    width: 60px;
    height: 60px;
    margin: 0 auto 16px;
    background: var(--bg);
    border: 1px solid var(--border2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
  }

  h6 {
    font-family: var(--font-ui);
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--th);
    margin: 0 0 6px;
  }

  p {
    font-family: var(--font-ui);
    font-size: 0.85rem;
    color: var(--tm);
    margin: 0;
  }
`;