import React, { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import apiRequest from "../../Services/apiRequest";
import { rootContext } from "../../App";
import alert from "../../Services/SweetAlert";
import PackageModal from "../Modals/PackageModal";

export default function Package() {
    const rootCtx = useContext(rootContext);

    const [packages, setPackages] = useState([]);
    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    const [showModal, setShowModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    // State for action dropdown
    const [activeActionId, setActiveActionId] = useState(null);

    // Close the dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveActionId(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        fetchPackages();
        // eslint-disable-next-line
    }, []);

    const fetchPackages = async () => {
        try {
            rootCtx[0](true);
            const res = await apiRequest.get("/package/");
            console.log("PACKAGE RESPONSE:", res);

            if (res?.status?.toLowerCase() === "success") {
                setPackages(res.result);
                setCurrentPage(1);
            } else {
                setPackages([]);
            }

        } catch (err) {
            console.log(err);
            alert.error("Failed to load packages");
        } finally {
            rootCtx[0](false);
        }
    };

    // DELETE
    const handleDelete = async (id) => {
        const confirm = await alert.confirm("Are you sure you want to delete?");
        if (!confirm) return;

        try {
            rootCtx[0](true);
            await apiRequest.delete(`/package/${id}`);
            alert.success("Deleted Successfully");
            fetchPackages();
        } catch (err) {
            alert.error("Delete Failed");
        } finally {
            rootCtx[0](false);
        }
    };

    // SEARCH
    const filteredPackages = useMemo(() => {
        return packages.filter(pkg =>
            pkg.title?.toLowerCase().includes(search.toLowerCase()) ||
            pkg.service?.title?.toLowerCase().includes(search.toLowerCase())
        );
    }, [packages, search]);

    // PAGINATION
    const totalPages = Math.ceil(filteredPackages.length / recordsPerPage);

    const paginatedPackages = useMemo(() => {
        const start = (currentPage - 1) * recordsPerPage;
        return filteredPackages.slice(start, start + recordsPerPage);
    }, [filteredPackages, currentPage]);

    const changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    return (
        <Container>
            {/* HEADER */}
            <HeaderSection>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <PageTitle>
                        Wellness <span>/ Packages</span>
                    </PageTitle>
                    <Sub>Manage your pricing plans and services</Sub>
                </div>
                
                <HeaderActions>
                    <InputWrapper>
                        <i className="bi bi-search" />
                        <Input
                            type="text"
                            placeholder="Search packages..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </InputWrapper>
                    <AddBtn
                        onClick={() => {
                            setSelectedPackage(null);
                            setShowModal(true);
                        }}
                    >
                        <i className="fa-solid fa-plus" style={{ marginRight: "6px" }} />
                        Add Package
                    </AddBtn>
                </HeaderActions>
            </HeaderSection>

            {/* TABLE */}
            <TableCard>
                {/* NAYA: TableContainer added for responsiveness */}
                <TableContainer>
                    <Table>
                        <thead>
                            <tr>
                                <th width="60" className="text-center">#</th>
                                <th>Service</th>
                                <th>Title</th>
                                <th className="text-center">Sessions</th>
                                <th className="text-center">Mins/Slot</th>
                                <th className="text-end">MRP</th>
                                <th className="text-end">Discount</th>
                                <th className="text-end">Selling Price</th>
                                <th width="80" className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPackages.length > 0 ? (
                                paginatedPackages.map((pkg, index) => (
                                    <tr key={pkg.id}>
                                        <td className="text-center">
                                            {(currentPage - 1) * recordsPerPage + index + 1}
                                        </td>
                                        <td>
                                            <ServiceBadge>{pkg.service}</ServiceBadge>
                                        </td>
                                        <td>
                                            <TitleText>{pkg.title}</TitleText>
                                        </td>
                                        <td className="text-center fw-bold">{pkg.sessions}</td>
                                        <td className="text-center text-muted">
                                            {pkg.appointment_slot_minutes}
                                        </td>
                                        <td className="text-end text-muted text-decoration-line-through">
                                            ₹{pkg.mrp_price}
                                        </td>
                                        <td className="text-end text-success">
                                            -₹{pkg.discount_price}
                                        </td>
                                        <td className="text-end">
                                            <SellingPrice>₹{pkg.selling_price}</SellingPrice>
                                        </td>
                                        <td className="text-center">
                                            <ActionContainer>
                                                <MenuButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveActionId(activeActionId === pkg.id ? null : pkg.id);
                                                    }}
                                                >
                                                    <i className="bi bi-three-dots-vertical" />
                                                </MenuButton>

                                                {activeActionId === pkg.id && (
                                                    <ActionDropdown>
                                                        <DropdownItem
                                                            onClick={() => {
                                                                setActiveActionId(null);
                                                                setSelectedPackage(pkg);
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
                                                                handleDelete(pkg.id);
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9">
                                        <EmptyState>
                                            <div className="icon-box">
                                                <i className="bi bi-box-seam" />
                                            </div>
                                            <h6>No Packages Found</h6>
                                            <p>Try adjusting your search criteria or add a new package.</p>
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
            <PackageModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                onSuccess={fetchPackages}
                editData={selectedPackage}
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
  min-width: 900px;

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
    &.text-end { text-align: right; }
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    font-family: var(--font-ui);
    color: var(--tb);
    vertical-align: middle;

    &.text-center { text-align: center; }
    &.text-end { text-align: right; }
  }

  tbody tr {
    transition: background 0.15s;
    &:hover { background: var(--bg); }
    &:last-child td { border-bottom: none; }
  }
`;

const ServiceBadge = styled.span`
  display: inline-flex;
  padding: 4px 10px;
  background: var(--grad-soft);
  color: var(--g1);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  border-radius: var(--r1);
`;

const TitleText = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--th);
`;

const SellingPrice = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: var(--th);
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
  min-width: 120px;
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

  i { font-size: 0.9rem; }

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