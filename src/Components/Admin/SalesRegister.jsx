import React, { useState, useContext } from "react";
import styled from "styled-components";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";
import { rootContext } from "../../App";
import * as XLSX from "xlsx";

export default function SalesRegister() {
    const rootCtx = useContext(rootContext);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState([]);
    const [totals, setTotals] = useState({});

    const generateReport = async () => {
        if (!startDate || !endDate) {
            return alert.error("Please select both Start and End dates.");
        }

        try {
            rootCtx[0](true);
            const url = `reports/sales-register?startDate=${startDate}&endDate=${endDate}`;
            const res = await apiRequest.get(url);

            if (res.status === "success") {
                setData(res.result);
                setTotals(res.totals);
            } else {
                setData([]);
            }
        } catch (error) {
            alert.error("Failed to fetch report");
        } finally {
            rootCtx[0](false);
        }
    };

    const exportToExcel = () => {
        if (data.length === 0) return alert.error("No data to export!");

        const headers = ["Date", "Invoice No", "Gross Amount", "GST Amount", "Net Amount"];
        const rows = data.map(row => [
            new Date(row.receipt_date).toLocaleDateString(),
            row.invoice_no,
            row.gross_amount,
            row.gst_amount,
            row.net_amount
        ]);
        rows.push(["TOTALS", "", totals.gross_amount, totals.gst_amount, totals.net_amount]);

        const worksheetData = [headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        worksheet["!cols"] = headers.map(() => ({ wch: 20 })); 

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
        XLSX.writeFile(workbook, `Sales_Register_${startDate}_to_${endDate}.xlsx`);
    };

    return (
        <Container>
            {/* Header Section */}
            <HeaderSection>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <PageTitle>
                        Reports <span>/ Sales Register</span>
                    </PageTitle>
                    <Sub>Generate and export sales data by date range.</Sub>
                </div>
                {data.length > 0 && (
                    <ExportBtn onClick={exportToExcel}>
                        <i className="fa-solid fa-file-excel" style={{ marginRight: "6px" }}></i> 
                        Export to Excel
                    </ExportBtn>
                )}
            </HeaderSection>

            {/* Filter Section */}
            <FilterCard>
                <GridRow>
                    <FormGroup>
                        <FormLabel>From Date</FormLabel>
                        <FormInput 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>To Date</FormLabel>
                        <FormInput 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                        />
                    </FormGroup>
                    <FormGroup style={{ justifyContent: "flex-end" }}>
                        <GenerateBtn onClick={generateReport}>
                            <i className="fa-solid fa-magnifying-glass" style={{ marginRight: "6px" }}></i> 
                            Generate Report
                        </GenerateBtn>
                    </FormGroup>
                </GridRow>
            </FilterCard>

            {/* Table / Empty State Section */}
            {data.length > 0 ? (
                <TableCard>
                    <Table>
                        <thead>
                            <tr>
                                <th className="ps-4">Date</th>
                                <th>Invoice No</th>
                                <th className="text-end">Gross Amount</th>
                                <th className="text-end">GST Amount</th>
                                <th className="text-end pe-4">Net Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => (
                                <tr key={i}>
                                    <td className="ps-4">
                                        <DateText>{new Date(row.receipt_date).toLocaleDateString()}</DateText>
                                    </td>
                                    <td>
                                        <InvoiceId>{row.invoice_no}</InvoiceId>
                                    </td>
                                    <td className="text-end">
                                        <AmountBase>₹{row.gross_amount}</AmountBase>
                                    </td>
                                    <td className="text-end">
                                        <AmountTax>₹{row.gst_amount}</AmountTax>
                                    </td>
                                    <td className="text-end pe-4">
                                        <AmountSuccess>₹{row.net_amount}</AmountSuccess>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <TableFooter>
                            <tr>
                                <td colSpan="2" className="text-end ps-4 label">TOTALS:</td>
                                <td className="text-end value">₹{totals?.gross_amount?.toFixed(2)}</td>
                                <td className="text-end value tax">₹{totals?.gst_amount?.toFixed(2)}</td>
                                <td className="text-end pe-4 value net">₹{totals?.net_amount?.toFixed(2)}</td>
                            </tr>
                        </TableFooter>
                    </Table>
                </TableCard>
            ) : (
                <EmptyState>
                    <div className="icon-box">
                        <i className="bi bi-calendar2-range" />
                    </div>
                    <h6>No Report Generated</h6>
                    <p>Select a start and end date, then click Generate to view the sales register.</p>
                </EmptyState>
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

const ExportBtn = styled.button`
  background: #10b981;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: var(--r2);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  white-space: nowrap;

  &:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
`;

const FilterCard = styled.div`
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  padding: 24px;
  box-shadow: var(--shadow-sm);
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-family: var(--font-ui);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--tm);
`;

const FormInput = styled.input`
  width: 100%;
  font-family: var(--font-ui);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--tb);
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: var(--r1);
  padding: 12px 14px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    background: var(--white);
    border-color: var(--g2);
    box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1);
  }
`;

const GenerateBtn = styled.button`
  background: var(--grad);
  color: var(--white);
  border: none;
  padding: 12px 20px;
  border-radius: var(--r1);
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 74, 110, 0.3);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 74, 110, 0.4);
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
  min-width: 800px;

  th {
    background: var(--bg);
    font-family: var(--font-ui);
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--tm);
    letter-spacing: 0.5px;
    padding: 16px;
    border-bottom: 2px solid var(--border);
    white-space: nowrap;
    
    &.text-end { text-align: right; }
    &.ps-4 { padding-left: 24px; }
    &.pe-4 { padding-right: 24px; }
  }

  td {
    padding: 16px;
    border-bottom: 1px solid var(--border);
    font-family: var(--font-ui);
    color: var(--tb);
    vertical-align: middle;

    &.text-end { text-align: right; }
    &.ps-4 { padding-left: 24px; }
    &.pe-4 { padding-right: 24px; }
  }

  tbody tr {
    transition: background 0.15s;
    &:hover { background: var(--bg); }
  }
`;

const TableFooter = styled.tfoot`
  background: var(--bg);
  border-top: 2px solid var(--border2);

  td {
    padding: 16px;
    border-bottom: none;
  }

  .label {
    font-family: var(--font-ui);
    font-size: 0.85rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--tm);
  }

  .value {
    font-family: var(--font-ui);
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--th);
  }

  .tax {
    color: var(--g1);
  }

  .net {
    color: #16a34a;
    font-size: 1.15rem;
  }
`;

const DateText = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--tb);
`;

const InvoiceId = styled.span`
  font-size: 0.9rem;
  font-family: monospace;
  font-weight: 700;
  color: var(--g1);
  background: var(--grad-soft);
  padding: 4px 8px;
  border-radius: 4px;
`;

const AmountBase = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--tb);
`;

const AmountTax = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--tm);
`;

const AmountSuccess = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: #16a34a;
`;

const EmptyState = styled.div`
  padding: 80px 20px;
  text-align: center;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  
  .icon-box {
    width: 72px;
    height: 72px;
    margin: 0 auto 20px;
    background: var(--grad-soft);
    color: var(--g1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }

  h6 {
    font-family: var(--font-ui);
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--th);
    margin: 0 0 8px;
  }

  p {
    font-family: var(--font-ui);
    font-size: 0.9rem;
    color: var(--tm);
    margin: 0;
  }
`;