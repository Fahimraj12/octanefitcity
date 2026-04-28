import React, { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import apiRequest from "../../Services/apiRequest";
import { rootContext } from "../../App";
import alert from "../../Services/SweetAlert";
import { useNavigate } from "react-router-dom";
import AppointmentView from "./AppointmentView";
import PaymentModal from "./PaymentModal";

export default function Appointment() {
    const rootCtx = useContext(rootContext);
    const setLoading = rootCtx[0];

    const [appointments, setAppointments] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewData, setViewData] = useState(null); // State for View Page
    const [paymentData, setPaymentData] = useState(null); // State for Payment Modal

    const recordsPerPage = 10;
    const navigate = useNavigate();
    const API_BASE_URL = "http://localhost:5000/"; // Added to fix the missing variable for profile image

    // Added state to track which row's action dropdown is open
    const [activeActionId, setActiveActionId] = useState(null);

    // Close the dropdown if the user clicks outside of it
    useEffect(() => {
        const handleClickOutside = () => setActiveActionId(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        fetchAppointments();
        // eslint-disable-next-line
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await apiRequest.get("appointment/");
            if (res.status?.toUpperCase() === "SUCCESS") {
                setAppointments(res.result || []);
            }
        } catch (err) {
            alert.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    const sendWhatsAppReminder = (item) => {
        const phone = item.Member?.mobile?.replace(/\D/g, "");
        if (!phone) {
            alert.error("Mobile number not available");
            return;
        }
        const message = `*OCTANE FIT CITY - Appointment Reminder*%0A%0AHello *${item.Member?.name}*,%0A%0AThis is a reminder for your session:%0A📦 *Package:* ${item.Package?.title}%0A📅 *Date:* ${item.date}%0A⏰ *Slot:* ${item.slot}%0A💰 *Amount:* ₹${item.amount}%0A💳 *Payment Status:* ${item.payment_status.toUpperCase()}%0A%0APlease arrive 10 minutes early. Thank you! 💪`;
        window.open(`https://wa.me/91${phone}?text=${message}`, "_blank");
    };

    const filteredData = useMemo(() => {
        return appointments.filter(item =>
            item.Member?.name?.toLowerCase().includes(search.toLowerCase()) ||
            item.Member?.mobile?.includes(search) ||
            item.Package?.title?.toLowerCase().includes(search.toLowerCase())
        );
    }, [appointments, search]);

    const totalPages = Math.ceil(filteredData.length / recordsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * recordsPerPage;
        return filteredData.slice(start, start + recordsPerPage);
    }, [filteredData, currentPage]);

    const changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Conditional Rendering for the View Page
    if (viewData) {
        return <AppointmentView data={viewData} onBack={() => setViewData(null)} />;
    }

    return (
        <Container>
            {/* HEADER */}
            <HeaderSection>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <PageTitle>
                        Wellness <span>/ Appointments</span>
                    </PageTitle>
                    <Sub>Manage member schedules and booking reminders</Sub>
                </div>
                
                <HeaderActions>
                    <InputWrapper>
                        <i className="bi bi-search" />
                        <Input
                            type="text"
                            placeholder="Search appointments..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </InputWrapper>
                    <AddBtn onClick={() => navigate("/Admin/add-appointment")}>
                        <i className="fa-solid fa-plus" style={{ marginRight: "6px" }} />
                        Book New
                    </AddBtn>
                </HeaderActions>
            </HeaderSection>

            {/* TABLE */}
            <TableCard>
                {/* NAYA: TableContainer added for mobile horizontal scrolling */}
                <TableContainer>
                    <Table>
                        <thead>
                            <tr>
                                <th className="ps-4">Member Info</th>
                                <th>Schedule</th>
                                <th>Package</th>
                                <th>Financials</th>
                                <th className="text-center" width="80">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item) => (
                                    <tr key={item.id}>
                                        {/* Member Info */}
                                        <td className="ps-4">
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                {/* CORRECTED: Changed item.member to item.Member */}
                                                <AvatarBox>
                                                    {item.Member?.profile_image ? (
                                                        <ProfileImg 
                                                            src={`${API_BASE_URL}${item.Member.profile_image.replace(/\\/g, "/")}`} 
                                                            alt={item.Member?.name} 
                                                        />
                                                    ) : (
                                                        item.Member?.name?.charAt(0).toUpperCase() || "?"
                                                    )}
                                                </AvatarBox>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <MemberName>{item.Member?.name}</MemberName>
                                                    <ContactInfo>
                                                        {item.Member?.mobile}
                                                    </ContactInfo>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Schedule */}
                                        <td>
                                            <ScheduleBox>
                                                <span className="date">
                                                    <i className="fa-regular fa-calendar-check" />
                                                    {item.date}
                                                </span>
                                                <span className="time">
                                                    <i className="fa-regular fa-clock" />
                                                    {item.slot}
                                                </span>
                                            </ScheduleBox>
                                        </td>

                                        {/* Package */}
                                        <td>
                                            <PackageBadge>{item.Package?.title}</PackageBadge>
                                        </td>

                                        {/* Financials */}
                                        <td>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                                                <AmountText>₹{item.amount}</AmountText>
                                                <StatusBadge $status={item.payment_status?.toLowerCase()}>
                                                    {item.payment_status?.toUpperCase()}
                                                </StatusBadge>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="text-center">
                                            <ActionContainer>
                                                <MenuButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveActionId(activeActionId === item.id ? null : item.id);
                                                    }}
                                                >
                                                    <i className="bi bi-three-dots-vertical" />
                                                </MenuButton>

                                                {activeActionId === item.id && (
                                                    <ActionDropdown>
                                                        <DropdownItem onClick={() => {
                                                            setActiveActionId(null);
                                                            setViewData(item);
                                                        }}>
                                                            <i className="fa-solid fa-eye" style={{ color: "#0ea5e9" }} /> 
                                                            View
                                                        </DropdownItem>
                                                        
                                                        {item.payment_status?.toLowerCase() === "pending" && (
                                                            <DropdownItem onClick={() => {
                                                                setActiveActionId(null);
                                                                setPaymentData(item);
                                                            }}>
                                                                <i className="fa-solid fa-credit-card" style={{ color: "#d97706" }} /> 
                                                                Pay Now
                                                            </DropdownItem>
                                                        )}
                                                        
                                                        <DropdownItem onClick={() => {
                                                            setActiveActionId(null);
                                                            alert.success("Generating PDF...");
                                                        }}>
                                                            <i className="fa-solid fa-file-pdf" style={{ color: "#ef4444" }} /> 
                                                            Invoice
                                                        </DropdownItem>
                                                        
                                                        <DropdownItem onClick={() => {
                                                            setActiveActionId(null);
                                                            sendWhatsAppReminder(item);
                                                        }}>
                                                            <i className="fa-brands fa-whatsapp" style={{ color: "#10b981" }} /> 
                                                            WhatsApp
                                                        </DropdownItem>
                                                    </ActionDropdown>
                                                )}
                                            </ActionContainer>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">
                                        <EmptyState>
                                            <div className="icon-box">
                                                <i className="bi bi-calendar-x" />
                                            </div>
                                            <h6>No Appointments Found</h6>
                                            <p>Try adjusting your search criteria.</p>
                                        </EmptyState>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </TableContainer>
            </TableCard>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <PaginationContainer>
                    <PageBtn
                        disabled={currentPage === 1}
                        onClick={() => changePage(currentPage - 1)}
                    >
                        <i className="fa-solid fa-angle-left"></i>
                    </PageBtn>

                    {[...Array(totalPages)].map((_, index) => (
                        <PageBtn
                            key={index}
                            $active={currentPage === index + 1}
                            onClick={() => changePage(index + 1)}
                        >
                            {index + 1}
                        </PageBtn>
                    ))}

                    <PageBtn
                        disabled={currentPage === totalPages}
                        onClick={() => changePage(currentPage + 1)}
                    >
                        <i className="fa-solid fa-angle-right"></i>
                    </PageBtn>
                </PaginationContainer>
            )}

            {/* Modals */}
            {paymentData && (
                <PaymentModal
                    data={paymentData}
                    onClose={() => setPaymentData(null)}
                    onSuccess={fetchAppointments}
                />
            )}
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

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  /* NAYA: Mobile media query */
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
  }
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

  /* NAYA: Mobile media query */
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  min-width: 250px;
  
  i {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--tm);
    font-size: 0.9rem;
  }

  /* NAYA: Mobile media query */
  @media (max-width: 576px) {
    flex: 1;
    min-width: 100%;
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

const AddBtn = styled.button`
  background: var(--grad);
  color: var(--white);
  border: none;
  padding: 10px 20px;
  border-radius: var(--r2);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 74, 110, 0.3);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 74, 110, 0.4);
  }

  /* NAYA: Mobile media query */
  @media (max-width: 576px) {
    width: 100%;
    justify-content: center;
  }
`;

const TableCard = styled.div`
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  box-shadow: var(--shadow-sm);
  overflow: visible; 
`;

/* 🔥 NAYA: Table Container added for horizontal scrolling on mobile */
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 250px; /* Space for the dropdown menu */
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
    text-align: left;
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
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--th);
  text-transform: capitalize;
`;

const ContactInfo = styled.div`
  font-size: 0.75rem;
  color: var(--tm);
`;

const ScheduleBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .date {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--th);
    display: flex;
    align-items: center;
    gap: 6px;
    i { color: var(--g1); }
  }

  .time {
    font-size: 0.75rem;
    color: var(--tm);
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const PackageBadge = styled.span`
  display: inline-flex;
  padding: 6px 12px;
  background: var(--bg);
  border: 1px solid var(--border2);
  color: var(--g3);
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: var(--r1);
`;

const AmountText = styled.div`
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--th);
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;

  ${({ $status }) => {
    switch ($status) {
      case "paid":
        return "background: #dcfce7; color: #16a34a;";
      case "pending":
        return "background: #fef3c7; color: #d97706;";
      default:
        return "background: var(--bg); color: var(--tm);";
    }
  }}
`;

/* ── ACTION DROPDOWN STYLES ── */
const ActionContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuButton = styled.button`
  background: transparent;
  border: none;
  color: var(--tm);
  font-size: 1.1rem;
  padding: 4px 8px;
  border-radius: var(--r1);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: var(--border);
    color: var(--tb);
  }
`;

const ActionDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: var(--white);
  border: 1px solid var(--border2);
  border-radius: var(--r1);
  box-shadow: var(--shadow-md);
  padding: 6px;
  min-width: 140px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  /* Quick slide up fade animation */
  animation: dropIn 0.15s ease-out forwards;
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DropdownItem = styled.button`
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  font-family: var(--font-ui);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--tb);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;

  i { font-size: 0.9rem; width: 16px; text-align: center; }

  &:hover { 
    background: var(--bg); 
    color: var(--th); 
  }
`;

/* ──────────────────────────── */

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding-bottom: 20px;
`;

const PageBtn = styled.button`
  min-width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ $active }) => ($active ? "transparent" : "var(--border2)")};
  background: ${({ $active }) => ($active ? "var(--grad)" : "var(--white)")};
  color: ${({ $active }) => ($active ? "var(--white)" : "var(--tb)")};
  border-radius: var(--r1);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: var(--g2);
    color: ${({ $active }) => ($active ? "var(--white)" : "var(--g2)")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--bg);
  }
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  
  .icon-box {
    width: 60px;
    height: 60px;
    margin: 0 auto 16px;
    background: var(--grad-soft);
    color: var(--g1);
    border-radius: var(--r2);
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