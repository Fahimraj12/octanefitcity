import React, { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../Services/apiRequest";
import { rootContext } from "../../App";
import alert from "../../Services/SweetAlert";
import MemberModal from "./../Modals/MemberModal";

// ============================================================
// HELPER FUNCTION: To format the URL correctly
// ============================================================
const getFileUrl = (path, API_BASE_URL) => {
    if (!path) return "";
    const cleanPath = path.replace(/\\/g, "/").replace(/^\//, "");
    return `${API_BASE_URL}${cleanPath}`;
};

// ============================================================
// NAYA: Fallback Avatar Component (Handles broken image links)
// ============================================================
const MemberAvatar = ({ profile_image, name, API_BASE_URL }) => {
    const [imageError, setImageError] = useState(false);
    const fallbackChar = name?.charAt(0).toUpperCase() || "?";

    // Agar image ka path hi nahi hai ya browser ko file nahi mili (404 Error)
    if (!profile_image || imageError) {
        return (
            <AvatarFallback>
                {fallbackChar}
            </AvatarFallback>
        );
    }

    return (
        <ProfileImage
            src={getFileUrl(profile_image, API_BASE_URL)}
            alt={name || "Member"}
            onError={() => setImageError(true)} // Ye line fail hone par fallback trigger karegi
        />
    );
};

export default function Member() {
    const rootCtx = useContext(rootContext);
    const navigate = useNavigate();

    const [members, setMembers] = useState([]);
    const [search, setSearch] = useState("");

    const [filters, setFilters] = useState({
        blood_group: "",
        student: "",
        status: ""
    });

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    const [showModal, setShowModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    // State for action dropdown
    const [activeActionId, setActiveActionId] = useState(null);

    const API_BASE_URL = "http://3.110.225.213:5000/";

    // Close the dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveActionId(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        fetchMembers();
        // eslint-disable-next-line
    }, []);

    const fetchMembers = async () => {
        try {
            rootCtx[0](true);
            const res = await apiRequest.get("member/get-member");
            console.log("Fetched Members:", res);

            if (res.status?.toUpperCase() === "SUCCESS" || res.data?.success) {
                setMembers(res.result || res.data?.data || []);
            } else {
                setMembers([]);
            }
        } catch (err) {
            alert.error("Failed to load members");
        } finally {
            rootCtx[0](false);
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        const confirm = await alert.confirm("Are you sure you want to delete?");
        if (!confirm) return;

        try {
            rootCtx[0](true);
            await apiRequest.delete(`member/delete-member/${id}`);
            alert.success("Deleted Successfully");
            fetchMembers();
        } catch (err) {
            alert.error("Delete Failed");
        } finally {
            rootCtx[0](false);
        }
    };

    // ================= FILTER =================
    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch =
                member.name?.toLowerCase().includes(search.toLowerCase()) ||
                member.email?.toLowerCase().includes(search.toLowerCase()) ||
                member.mobile?.includes(search) ||
                member.document_number?.toLowerCase().includes(search.toLowerCase());

            const matchesBlood = !filters.blood_group || member.blood_group === filters.blood_group;
            const matchesStudent = !filters.student || member.student === filters.student;
            const matchesStatus = !filters.status || member.status === filters.status;

            return matchesSearch && matchesBlood && matchesStudent && matchesStatus;
        });
    }, [members, filters, search]);

    // ================= PAGINATION =================
    const totalPages = Math.ceil(filteredMembers.length / recordsPerPage);

    const paginatedMembers = useMemo(() => {
        const start = (currentPage - 1) * recordsPerPage;
        return filteredMembers.slice(start, start + recordsPerPage);
    }, [filteredMembers, currentPage]);

    const changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, search]);

    const currentYear = new Date().getFullYear();

    return (
        <Container>
            {/* HEADER */}
            <HeaderSection>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <PageTitle>
                        OFC Members <span>/ List</span>
                    </PageTitle>
                    <Sub>Manage your gym members and profiles</Sub>
                </div>

                <AddBtn
                    onClick={() => {
                        setSelectedMember(null);
                        setShowModal(true);
                    }}
                >
                    <i className="bi bi-plus-lg" style={{ marginRight: "6px" }} />
                    Add Member
                </AddBtn>
            </HeaderSection>

            {/* FILTER SECTION */}
            <FilterCard>
                <FormGroup style={{ flex: 2 }}>
                    <Label>Search</Label>
                    <InputWrapper>
                        <i className="bi bi-search" />
                        <Input
                            type="text"
                            placeholder="Search name, email, mobile, doc..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </InputWrapper>
                </FormGroup>

                <FormGroup style={{ flex: 1 }}>
                    <Label>Blood Group</Label>
                    <Select
                        value={filters.blood_group}
                        onChange={(e) =>
                            setFilters({ ...filters, blood_group: e.target.value })
                        }
                    >
                        <option value="">All Blood Groups</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                    </Select>
                </FormGroup>

                <FormGroup style={{ flex: 1 }}>
                    <Label>Student</Label>
                    <Select
                        value={filters.student}
                        onChange={(e) =>
                            setFilters({ ...filters, student: e.target.value })
                        }
                    >
                        <option value="">All</option>
                        <option value="yes">Student</option>
                        <option value="no">Non Student</option>
                    </Select>
                </FormGroup>

                <FormGroup style={{ flex: 1 }}>
                    <Label>Status</Label>
                    <Select
                        value={filters.status}
                        onChange={(e) =>
                            setFilters({ ...filters, status: e.target.value })
                        }
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </Select>
                </FormGroup>
            </FilterCard>

            {/* TABLE */}
            <TableCard>
                <TableContainer>
                    <Table>
                        <thead>
                            <tr>
                                <th width="60" className="text-center">#</th>
                                <th width="80" className="text-center">Profile</th>
                                <th width="200">Name</th>
                                <th>Contact Info</th>
                                <th>Document</th>
                                <th width="140" className="text-center">Plan</th>
                                <th width="100" className="text-center">BMI Quota</th>
                                <th width="100" className="text-center">Status</th>
                                <th width="80" className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMembers.length > 0 ? (
                                paginatedMembers.map((member, index) => {
                                    
                                    // 1. Calculate BMI Quota per member
                                    const bmiHistoryList = member.bmi_history || member.BmiHistories || [];
                                    const freeUsedThisYear = bmiHistoryList.filter(b => 
                                        b.is_free && new Date(b.check_date || b.createdAt).getFullYear() === currentYear
                                    ).length;
                                    const freeRemaining = Math.max(0, 2 - freeUsedThisYear);

                                    // 2. Calculate Membership Plan & Remaining Days
                                    const rawMembership = member.Memberships || member.UserMemberships || member.memberships || member.membership || [];
                                    const membershipList = Array.isArray(rawMembership) ? rawMembership : [rawMembership].filter(Boolean);
                                    
                                    const activeMembership = membershipList.find(m => m.status?.toLowerCase() === 'active') || 
                                        (membershipList.length > 0 ? membershipList.sort((a, b) => new Date(b.end_at) - new Date(a.end_at))[0] : null);

                                    let daysRemaining = 0;
                                    let isExpired = false;
                                    let planName = "N/A";

                                    if (activeMembership && activeMembership.end_at) {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0); 
                                        const endDate = new Date(activeMembership.end_at);
                                        endDate.setHours(0, 0, 0, 0);
                                        
                                        daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                                        isExpired = daysRemaining < 0;
                                        planName = activeMembership.membershipPackage?.name || activeMembership.plan_name || 'Active Plan';
                                    }

                                    return (
                                        <tr key={member.id}>
                                            <td className="text-center">
                                                {(currentPage - 1) * recordsPerPage + index + 1}
                                            </td>

                                            {/* Profile Image Column (Naya avatar system lagaya yahan) */}
                                            <td className="text-center">
                                                <MemberAvatar 
                                                    profile_image={member.profile_image} 
                                                    name={member.name} 
                                                    API_BASE_URL={API_BASE_URL} 
                                                />
                                            </td>

                                            <td>
                                                <MemberName>{member.name}</MemberName>
                                                <BloodGroupText>Blood: {member.blood_group || "N/A"}</BloodGroupText>
                                            </td>

                                            <td>
                                                <ContactInfo>
                                                    <span><i className="fa-solid fa-envelope"></i> {member.email}</span>
                                                    <span><i className="fa-solid fa-phone"></i> {member.mobile}</span>
                                                </ContactInfo>
                                            </td>

                                            {/* Document Column */}
                                            <td>
                                                {member.document_type ? (
                                                    <DocBox>
                                                        <span className="doc-type">{member.document_type}</span>
                                                        <span className="doc-num">{member.document_number}</span>
                                                        {member.document_file && (
                                                            <a
                                                                href={getFileUrl(member.document_file, API_BASE_URL)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="doc-link"
                                                            >
                                                                <i className="fa-solid fa-file-arrow-down"></i> View File
                                                            </a>
                                                        )}
                                                    </DocBox>
                                                ) : (
                                                    <span className="text-muted" style={{ fontSize: "0.8rem" }}>N/A</span>
                                                )}
                                            </td>

                                            {/* Membership Plan Column */}
                                            <td className="text-center">
                                                {activeMembership ? (
                                                    <>
                                                        <PlanBadge $expired={isExpired}>
                                                            {planName.length > 15 ? planName.substring(0, 15) + '...' : planName}
                                                        </PlanBadge>
                                                        <div style={{ 
                                                            fontSize: '0.65rem', 
                                                            color: isExpired ? '#ef4444' : 'var(--tm)', 
                                                            marginTop: '4px', 
                                                            fontWeight: 'bold' 
                                                        }}>
                                                            {isExpired ? 'Expired' : `${daysRemaining} Days Left`}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-muted" style={{ fontSize: "0.8rem", fontWeight: "600" }}>
                                                        Not Taken
                                                    </span>
                                                )}
                                            </td>

                                            {/* BMI Quota Column */}
                                            <td className="text-center">
                                                <BmiBadge $remaining={freeRemaining}>
                                                    {freeRemaining} / 2 Left
                                                </BmiBadge>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--tm)', marginTop: '4px', fontWeight: 'bold' }}>
                                                    Used: {freeUsedThisYear}
                                                </div>
                                            </td>

                                            <td className="text-center">
                                                <Badge
                                                    $variant={
                                                        member.status === "active" ? "success" : "danger"
                                                    }
                                                >
                                                    {member.status}
                                                </Badge>
                                            </td>

                                            <td className="text-center">
                                                <ActionContainer>
                                                    <MenuButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveActionId(activeActionId === member.id ? null : member.id);
                                                        }}
                                                    >
                                                        <i className="bi bi-three-dots-vertical" />
                                                    </MenuButton>

                                                    {activeActionId === member.id && (
                                                        <ActionDropdown>
                                                            <DropdownItem
                                                                onClick={() => {
                                                                    setActiveActionId(null);
                                                                    navigate(`/admin/member-details/${member.id}`);
                                                                }}
                                                            >
                                                                <i className="fa-solid fa-eye" style={{ color: "#0ea5e9" }} />
                                                                View Profile
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                onClick={() => {
                                                                    setActiveActionId(null);
                                                                    setSelectedMember(member);
                                                                    setShowModal(true);
                                                                }}
                                                            >
                                                                <i className="fa-solid fa-pen-to-square" style={{ color: "#d97706" }} />
                                                                Edit
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                className="delete"
                                                                onClick={() => {
                                                                    setActiveActionId(null);
                                                                    handleDelete(member.id);
                                                                }}
                                                            >
                                                                <i className="fa-solid fa-trash" style={{ color: "#dc2626" }} />
                                                                Delete
                                                            </DropdownItem>
                                                        </ActionDropdown>
                                                    )}
                                                </ActionContainer>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="9">
                                        <EmptyState>
                                            <div className="icon-box">
                                                <i className="bi bi-people" />
                                            </div>
                                            <h6>No Members Found</h6>
                                            <p>Try adjusting your search criteria or add a new member.</p>
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

            {/* MODAL */}
            <MemberModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                onSuccess={fetchMembers}
                editData={selectedMember}
            />
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

  @media (max-width: 576px) {
    width: 100%;
    justify-content: center;
  }
`;

const FilterCard = styled.div`
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: var(--shadow-sm);

  @media (max-width: 768px) {
    flex-direction: column;
    > div { flex: 1 1 100% !important; }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
`;

const Label = styled.label`
  font-family: var(--font-ui);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--tm);
  letter-spacing: 0.5px;
`;

const InputWrapper = styled.div`
  position: relative;
  i {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--tm);
    font-size: 0.9rem;
  }
`;

const FormBase = `
  width: 100%;
  font-family: var(--font-ui);
  font-size: 0.85rem;
  color: var(--tb);
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: var(--r1);
  padding: 10px 14px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    background: var(--white);
    border-color: var(--g2);
    box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1);
  }
`;

const Input = styled.input`
  ${FormBase}
  padding-left: 36px;
`;

const Select = styled.select`
  ${FormBase}
  cursor: pointer;
`;

const TableCard = styled.div`
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  box-shadow: var(--shadow-sm);
  overflow: visible; 
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 250px; 
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 950px;

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
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    font-family: var(--font-ui);
    color: var(--tb);
    vertical-align: middle;

    &.text-center { text-align: center; }
  }

  tbody tr {
    transition: background 0.15s;
    &:hover { background: var(--bg); }
    &:last-child td { border-bottom: none; }
  }
`;

const ProfileImage = styled.img`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 2px solid var(--white);
  flex-shrink: 0;
`;

const AvatarFallback = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: var(--grad);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 auto;
  box-shadow: 0 4px 10px rgba(255, 74, 110, 0.3);
  flex-shrink: 0;
`;

const MemberName = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--th);
  text-transform: capitalize;
`;

const BloodGroupText = styled.div`
  font-size: 0.75rem;
  color: var(--tm);
  margin-top: 2px;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--tb);

  span {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  i { color: var(--tm); font-size: 0.75rem; }
`;

const DocBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .doc-type {
    background: #e0f2fe;
    color: #0284c7;
    font-size: 0.7rem;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .doc-num {
    font-size: 0.8rem;
    color: var(--tb);
    font-family: monospace;
  }

  .doc-link {
    font-size: 0.75rem;
    color: var(--g1);
    text-decoration: none;
    font-weight: 600;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: 0.2s;

    &:hover {
      color: var(--g2);
      text-decoration: underline;
    }
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;

  ${({ $variant }) => {
    switch ($variant) {
      case "danger":
        return "background: #fee2e2; color: #dc2626;";
      case "success":
        return "background: #dcfce7; color: #16a34a;";
      default:
        return "background: var(--bg); color: var(--tm); border: 1px solid var(--border2);";
    }
  }}
`;

/* ── PLAN BADGE ── */
const PlanBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  white-space: nowrap;
  
  background: ${({ $expired }) => ($expired ? "#fee2e2" : "#e0f2fe")};
  color: ${({ $expired }) => ($expired ? "#dc2626" : "#0284c7")};
  border: 1px solid ${({ $expired }) => ($expired ? "#fecaca" : "#bae6fd")};
`;

/* ── BMI QUOTA BADGE ── */
const BmiBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  white-space: nowrap;
  letter-spacing: 0.5px;
  transition: 0.3s;
  
  background: ${({ $remaining }) => ($remaining > 0 ? "#dcfce7" : "#fee2e2")};
  color: ${({ $remaining }) => ($remaining > 0 ? "#16a34a" : "#dc2626")};
  border: 1px solid ${({ $remaining }) => ($remaining > 0 ? "#bbf7d0" : "#fecaca")};
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
  min-width: 130px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 2px;
  
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
    color: var(--g1); 
  }

  &.delete:hover {
    background: #fef2f2;
    color: #ef4444;
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