import React, { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import apiRequest from "../../Services/apiRequest";
import { rootContext } from "../../App";
import alert from "../../Services/SweetAlert";
import FitnessGoalModal from "../Modals/FitnessGoalModal";

export default function FitnessGoal() {
    const rootCtx = useContext(rootContext);

    const [goals, setGoals] = useState([]);
    const [search, setSearch] = useState("");

    const [filters, setFilters] = useState({
        status: ""
    });

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    const [showModal, setShowModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    // State for action dropdown
    const [activeActionId, setActiveActionId] = useState(null);

    // Close the dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveActionId(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        fetchGoals();
        // eslint-disable-next-line
    }, []);

    const fetchGoals = async () => {
        try {
            rootCtx[0](true);
            const res = await apiRequest.get("fitness/get-fitness-goals");

            if (res.status?.toUpperCase() === "SUCCESS") {
                setGoals(res.result);
            } else {
                setGoals([]);
            }
        } catch (err) {
            alert.error("Failed to load fitness goals");
        } finally {
            rootCtx[0](false);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await alert.confirm("Are you sure you want to delete?");
        if (!confirm) return;

        try {
            rootCtx[0](true);
            await apiRequest.delete(`fitness/delete-fitness-goal/${id}`);
            alert.success("Deleted Successfully");
            fetchGoals();
        } catch (err) {
            alert.error("Delete Failed");
        } finally {
            rootCtx[0](false);
        }
    };

    const filteredGoals = useMemo(() => {
        return goals.filter(goal => {
            const matchesSearch =
                goal.title?.toLowerCase().includes(search.toLowerCase()) ||
                goal.description?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                !filters.status || goal.status === filters.status;

            return matchesSearch && matchesStatus;
        });
    }, [goals, search, filters]);

    const totalPages = Math.ceil(filteredGoals.length / recordsPerPage);

    const paginatedGoals = useMemo(() => {
        const start = (currentPage - 1) * recordsPerPage;
        return filteredGoals.slice(start, start + recordsPerPage);
    }, [filteredGoals, currentPage]);

    const changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, search]);

    return (
        <Container>
            {/* HEADER */}
            <HeaderSection>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <PageTitle>
                        Fitness <span>/ Goals</span>
                    </PageTitle>
                    <Sub>Manage predefined fitness goals and objectives.</Sub>
                </div>
                
                <AddBtn
                    onClick={() => {
                        setSelectedGoal(null);
                        setShowModal(true);
                    }}
                >
                    <i className="bi bi-plus-lg" style={{ marginRight: "6px" }} />
                    Add Goal
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
                            placeholder="Search title or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </InputWrapper>
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
                <Table>
                    <thead>
                        <tr>
                            <th width="60" className="text-center">#</th>
                            <th width="250">Title</th>
                            <th>Description</th>
                            <th width="120" className="text-center">Status</th>
                            <th width="80" className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedGoals.length > 0 ? (
                            paginatedGoals.map((goal, index) => (
                                <tr key={goal.id}>
                                    <td className="text-center">
                                        {(currentPage - 1) * recordsPerPage + index + 1}
                                    </td>
                                    <td>
                                        <TitleText>{goal.title}</TitleText>
                                    </td>
                                    <td>
                                        <DescText>{goal.description}</DescText>
                                    </td>
                                    <td className="text-center">
                                        <Badge
                                            $variant={
                                                goal.status === "active" ? "success" : "danger"
                                            }
                                        >
                                            {goal.status}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <ActionContainer>
                                            <MenuButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveActionId(activeActionId === goal.id ? null : goal.id);
                                                }}
                                            >
                                                <i className="bi bi-three-dots-vertical" />
                                            </MenuButton>

                                            {activeActionId === goal.id && (
                                                <ActionDropdown>
                                                    <DropdownItem
                                                        onClick={() => {
                                                            setActiveActionId(null);
                                                            setSelectedGoal(goal);
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
                                                            handleDelete(goal.id);
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
                                <td colSpan="5">
                                    <EmptyState>
                                        <div className="icon-box">
                                            <i className="bi bi-bullseye" />
                                        </div>
                                        <h6>No Goals Found</h6>
                                        <p>Try adjusting your search criteria or add a new goal.</p>
                                    </EmptyState>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
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
            <FitnessGoalModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                onSuccess={fetchGoals}
                editData={selectedGoal}
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
  padding-bottom: 20px;

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
  min-width: 200px;
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
  overflow-x: auto;
  overflow-y: visible; /* Dropdown visibility */
  
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

const TitleText = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--th);
`;

const DescText = styled.div`
  font-size: 0.82rem;
  color: var(--tm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
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
  padding: 60px 20px;
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