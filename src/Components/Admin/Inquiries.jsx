import React, { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import apiRequest from "../../Services/apiRequest";
import { rootContext } from "../../App";
import alert from "../../Services/SweetAlert";
import InquiryModal from "../Modals/InquiryModal";

export default function Inquiries() {
  const rootCtx = useContext(rootContext);

  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    convert: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Added state to track which row's action dropdown is open
  const [activeActionId, setActiveActionId] = useState(null);

  // Close the dropdown if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = () => setActiveActionId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchInquiries();
    // eslint-disable-next-line
  }, []);

  const fetchInquiries = async () => {
    try {
      rootCtx[0](true);
      const res = await apiRequest.get("inquiries/");

      if (
        res.status === "success" ||
        res.status === "ok" ||
        res.status?.toUpperCase() === "SUCCESS"
      ) {
        setInquiries(res.result || res.data?.data || []);
      } else {
        setInquiries([]);
      }
    } catch (err) {
      alert.error("Failed to load inquiries");
    } finally {
      rootCtx[0](false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      rootCtx[0](true);
      await apiRequest.patch(`inquiries/${id}/status`, { status: newStatus });
      alert.toast("Status updated");
      fetchInquiries();
    } catch (error) {
      alert.error("Failed to update status");
    } finally {
      rootCtx[0](false);
    }
  };

  // ================= DELETE FUNCTION =================
  const handleDelete = async (id) => {
    const confirm = await alert.confirm(
      "Are you sure you want to delete this inquiry?"
    );
    if (!confirm) return;

    try {
      rootCtx[0](true);
      await apiRequest.delete(`inquiries/${id}`);
      alert.success("Inquiry Deleted Successfully");
      fetchInquiries();
    } catch (err) {
      alert.error("Failed to delete inquiry");
    } finally {
      rootCtx[0](false);
    }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesSearch =
        inq.name?.toLowerCase().includes(search.toLowerCase()) ||
        inq.mobile?.includes(search) ||
        inq.email?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = !filters.status || inq.status === filters.status;
      const matchesConvert = !filters.convert || inq.convert === filters.convert;

      return matchesSearch && matchesStatus && matchesConvert;
    });
  }, [inquiries, filters, search]);

  const totalPages = Math.ceil(filteredInquiries.length / recordsPerPage);

  const paginatedInquiries = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return filteredInquiries.slice(start, start + recordsPerPage);
  }, [filteredInquiries, currentPage]);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, search]);

  return (
    <Container>
      {/* HEADER */}
      <HeaderSection>
        <PageTitle>
          Inquiries <span>/ Leads</span>
        </PageTitle>
        <AddBtn
          onClick={() => {
            setSelectedInquiry(null);
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg" style={{ marginRight: "6px" }} />
          Add Inquiry
        </AddBtn>
      </HeaderSection>

      {/* FILTER SECTION */}
      <FilterCard>
        <FormGroup>
          <Label>Search</Label>
          <InputWrapper>
            <i className="bi bi-search" />
            <Input
              type="text"
              placeholder="Search name, mobile, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputWrapper>
        </FormGroup>

        <FormGroup>
          <Label>Lead Type</Label>
          <Select
            value={filters.convert}
            onChange={(e) => setFilters({ ...filters, convert: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Status</Label>
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
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
                <th>Date</th>
                <th>Prospect Details</th>
                <th>Source</th>
                <th>Type</th>
                <th width="160">Status</th>
                <th width="80" className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInquiries.length > 0 ? (
                paginatedInquiries.map((inq, index) => (
                  <tr key={inq.id}>
                    <td className="text-center">
                      {(currentPage - 1) * recordsPerPage + index + 1}
                    </td>

                    <td>
                      <DateText>
                        {new Date(inq.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </DateText>
                    </td>

                    <td>
                      <ProspectName>{inq.name}</ProspectName>
                      <ProspectMeta>
                        <i className="fa-solid fa-phone"></i>
                        {inq.mobile}
                      </ProspectMeta>
                    </td>

                    <td>
                      <Badge $variant="secondary">{inq.source}</Badge>
                    </td>

                    <td>
                      <Badge
                        $variant={
                          inq.convert === "Hot"
                            ? "danger"
                            : inq.convert === "Warm"
                            ? "warning"
                            : "info"
                        }
                      >
                        {inq.convert}
                      </Badge>
                    </td>

                    <td>
                      <StatusSelect
                        $status={inq.status}
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                      </StatusSelect>
                    </td>

                    {/* UPDATE: Action Dropdown */}
                    <td className="text-center">
                      <ActionContainer>
                        <MenuButton
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent document click from closing it immediately
                            setActiveActionId(activeActionId === inq.id ? null : inq.id);
                          }}
                        >
                          <i className="bi bi-three-dots-vertical" />
                        </MenuButton>

                        {activeActionId === inq.id && (
                          <ActionDropdown>
                            <DropdownItem
                              onClick={() => {
                                setActiveActionId(null);
                                setSelectedInquiry(inq);
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
                                handleDelete(inq.id);
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
                  <td colSpan="7">
                    <EmptyState>
                      <div className="icon-box">
                        <i className="bi bi-inboxes" />
                      </div>
                      <h6>No Inquiries Found</h6>
                      <p>Try adjusting your search or filters.</p>
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
      <InquiryModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSuccess={fetchInquiries}
        editData={selectedInquiry}
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

  @media (max-width: 480px) {
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 74, 110, 0.4);
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const FilterCard = styled.div`
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  box-shadow: var(--shadow-sm);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
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
`;

/* 🔥 NAYA: Table Container added for horizontal scrolling on mobile */
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  /* Extra min-height gives the dropdown menu room to display if there is only 1 row */
  min-height: 250px; 
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

const DateText = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--tb);
`;

const ProspectName = styled.div`
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--th);
  margin-bottom: 2px;
`;

const ProspectMeta = styled.div`
  font-size: 0.75rem;
  color: var(--tm);
  display: flex;
  align-items: center;
  gap: 6px;
  i { font-size: 0.65rem; }
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
      case "warning":
        return "background: #fef3c7; color: #d97706;";
      case "info":
        return "background: #e0f2fe; color: #0284c7;";
      case "success":
        return "background: #dcfce7; color: #16a34a;";
      default:
        return "background: var(--bg); color: var(--tm); border: 1px solid var(--border2);";
    }
  }}
`;

const StatusSelect = styled.select`
  font-family: var(--font-ui);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: var(--r1);
  outline: none;
  cursor: pointer;
  width: 100%;
  border: 1px solid;
  transition: all 0.2s ease;

  ${({ $status }) => {
    if ($status === "open") {
      return `
        color: #16a34a; background: #f0fdf4; border-color: #bbf7d0;
        &:focus { box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1); }
      `;
    }
    if ($status === "pending") {
      return `
        color: #d97706; background: #fffbeb; border-color: #fde68a;
        &:focus { box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1); }
      `;
    }
    return `
      color: var(--tm); background: var(--bg); border-color: var(--border2);
      &:focus { box-shadow: 0 0 0 3px rgba(148, 144, 170, 0.1); }
    `;
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