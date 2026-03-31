import React, { useContext, useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import apiRequest from "../../Services/apiRequest";
import { rootContext } from "../../App";
import alert from "../../Services/SweetAlert";

export default function InvoiceList() {
    const rootCtx = useContext(rootContext);
    const [invoices, setInvoices] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    useEffect(() => {
        fetchInvoices();
        // eslint-disable-next-line
    }, []);

    const fetchInvoices = async () => {
        try {
            rootCtx[0](true);
            const res = await apiRequest.get("invoice/"); 
            if (res.status === "success") {
                setInvoices(res.result || []);
            }
        } catch (err) {
            alert.error("Failed to load invoices");
        } finally {
            rootCtx[0](false);
        }
    };

    const filteredData = useMemo(() => {
        if (!search.trim()) return invoices;
        return invoices.filter((inv) =>
            inv.invoice_no?.toLowerCase().includes(search.toLowerCase()) ||
            inv.UserMembership?.member?.name?.toLowerCase().includes(search.toLowerCase())
        );
    }, [invoices, search]);

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

    return (
        <Container>
            {/* Header Section */}
            <HeaderSection>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <PageTitle>
                        Billing <span>/ Invoices</span>
                    </PageTitle>
                    <Sub>Review all generated invoices and payment statuses.</Sub>
                </div>
                <HeaderActions>
                    <InputWrapper>
                        <i className="bi bi-search" />
                        <Input
                            type="text"
                            placeholder="Search Invoice or Name..."
                            value={search}
                            onChange={(e) => { 
                                setSearch(e.target.value); 
                                setCurrentPage(1); 
                            }}
                        />
                    </InputWrapper>
                </HeaderActions>
            </HeaderSection>

            {/* Table Section */}
            <TableCard>
                <Table>
                    <thead>
                        <tr>
                            <th className="ps-4">Invoice No</th>
                            <th>Date</th>
                            <th>Member Name</th>
                            <th className="text-end">Net Amount</th>
                            <th className="text-end">Paid</th>
                            <th className="text-end">Due</th>
                            <th width="120" className="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((inv) => {
                                const totalPaid = (inv.Payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
                                const due = inv.net_amount - totalPaid;

                                return (
                                    <tr key={inv.id}>
                                        <td className="ps-4">
                                            <InvoiceId>{inv.invoice_no}</InvoiceId>
                                        </td>
                                        <td>
                                            <DateText>{new Date(inv.receipt_date).toLocaleDateString()}</DateText>
                                        </td>
                                        <td>
                                            <MemberName>{inv.UserMembership?.member?.name || "N/A"}</MemberName>
                                        </td>
                                        <td className="text-end">
                                            <AmountBase>₹{inv.net_amount}</AmountBase>
                                        </td>
                                        <td className="text-end">
                                            <AmountSuccess>₹{totalPaid}</AmountSuccess>
                                        </td>
                                        <td className="text-end">
                                            <AmountDanger>₹{due}</AmountDanger>
                                        </td>
                                        <td className="text-center">
                                            <Badge $status={inv.payment_status}>
                                                {inv.payment_status}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7">
                                    <EmptyState>
                                        <div className="icon-box">
                                            <i className="bi bi-receipt" />
                                        </div>
                                        <h6>No Invoices Found</h6>
                                        <p>Try adjusting your search criteria.</p>
                                    </EmptyState>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </TableCard>

            {/* Pagination UI */}
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
    &.ps-4 { padding-left: 24px; }
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    font-family: var(--font-ui);
    color: var(--tb);
    vertical-align: middle;

    &.text-center { text-align: center; }
    &.text-end { text-align: right; }
    &.ps-4 { padding-left: 24px; }
  }

  tbody tr {
    transition: background 0.15s;
    &:hover { background: var(--bg); }
    &:last-child td { border-bottom: none; }
  }
`;

const InvoiceId = styled.span`
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--g1);
`;

const MemberName = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--th);
  text-transform: capitalize;
`;

const DateText = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--tb);
`;

const AmountBase = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--tb);
`;

const AmountSuccess = styled.div`
  font-size: 0.95rem;
  font-weight: 800;
  color: #16a34a;
`;

const AmountDanger = styled.div`
  font-size: 0.95rem;
  font-weight: 800;
  color: #dc2626;
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

  ${({ $status }) => {
    switch ($status) {
      case "unpaid":
        return "background: #fee2e2; color: #dc2626;";
      case "paid":
        return "background: #dcfce7; color: #16a34a;";
      case "partial":
        return "background: #fef3c7; color: #d97706;";
      default:
        return "background: var(--bg); color: var(--tm); border: 1px solid var(--border2);";
    }
  }}
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