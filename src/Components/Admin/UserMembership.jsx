import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import styled from "styled-components";
import apiRequest from "../../Services/apiRequest";
import { rootContext } from "../../App";
import alert from "../../Services/SweetAlert";
import UserMembershipModal from "../Modals/UserMembershipModal";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../../assets/images.png";
import * as XLSX from "xlsx"; 

export default function UserMembership() {
    const rootCtx = useContext(rootContext);
    const invoiceRef = useRef();
    const [memberships, setMemberships] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    const [showModal, setShowModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [activeActionId, setActiveActionId] = useState(null);

    // EXCEL EXPORT STATES
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // OUTSTANDING PAYMENT STATES
    const [showPayModal, setShowPayModal] = useState(false);
    const [payData, setPayData] = useState(null);
    const [payAmount, setPayAmount] = useState("");
    const [payMode, setPayMode] = useState("cash");
    const [isPaying, setIsPaying] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = () => setActiveActionId(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const goToAddMembership = () => {
        navigate("/admin/AddUserMembership");
    };

    useEffect(() => {
        fetchMemberships();
        // eslint-disable-next-line
    }, []);

    const fetchMemberships = async () => {
        try {
            rootCtx[0](true);
            const res = await apiRequest.get("usermembership/");
            if (res.status === "success") {
                setMemberships(res.result || []);
                setCurrentPage(1);
            } else {
                setMemberships([]);
            }
        } catch (err) {
            alert.error("Failed to load memberships");
        } finally {
            rootCtx[0](false);
        }
    };

    const handleExportExcel = () => {
        if (!fromDate || !toDate) {
            alert.error("Please select both From Date and To Date to export.");
            return;
        }

        const startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);

        const filteredForExcel = memberships.filter((m) => {
            const memberDate = new Date(m.start_at); 
            return memberDate >= startDate && memberDate <= endDate;
        });

        if (filteredForExcel.length === 0) {
            alert.error("No memberships found in this date range.");
            return;
        }

        const excelData = filteredForExcel.map((m, index) => {
            const payments = m.InvoiceMaster?.Payments || [];
            const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
            const packagePrice = m.InvoiceMaster?.net_amount || m.membershipPackage?.selling_price || totalPaid;
            const dueAmount = packagePrice - totalPaid;
            
            const pkg = m.membershipPackage || {};
            const mrp = pkg.mrp || packagePrice;
            const gstStatus = pkg.gst_status || "excluded";
            const gstPercent = pkg.gst_percentage || 0;

            return {
                "Sr No.": index + 1,
                "Member Name": m.member?.name || "-",
                "Mobile Number": m.member?.mobile || "-",
                "Email ID": m.member?.email || m.member?.email_id || m.member?.emailId || m.member?.Email || "Not Provided",
                "Package Name": pkg.name || "-",
                "Start Date": m.start_at ? m.start_at.substring(0, 10) : "-",
                "End Date": m.end_at ? m.end_at.substring(0, 10) : "-",
                "Membership Status": m.status ? m.status.toUpperCase() : "-",
                "Payment Status": m.InvoiceMaster?.payment_status ? m.InvoiceMaster.payment_status.toUpperCase() : "-",
                "MRP (₹)": mrp,
                "GST Details": gstStatus === "included" ? `Included (${gstPercent}%)` : `Excluded`,
                "Net Amount (₹)": packagePrice,
                "Total Paid (₹)": totalPaid,
                "Balance Due (₹)": dueAmount > 0 ? dueAmount : 0
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        const columnWidths = [
            { wch: 8 },   { wch: 25 },  { wch: 15 },  { wch: 30 },  { wch: 25 },
            { wch: 15 },  { wch: 15 },  { wch: 20 },  { wch: 20 },  { wch: 12 },
            { wch: 15 },  { wch: 15 },  { wch: 15 },  { wch: 15 }
        ];
        worksheet["!cols"] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Memberships Data");

        XLSX.writeFile(workbook, `Octane_Memberships_${fromDate}_to_${toDate}.xlsx`);
    };

    const openPayModal = (m) => {
        const totalAmount = m.InvoiceMaster?.net_amount || m.membershipPackage?.selling_price || 0;
        const payments = m.InvoiceMaster?.Payments || [];
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const due = totalAmount - totalPaid;

        setPayData({ membership: m, due: due, invoice_id: m.InvoiceMaster?.id, totalAmount: totalAmount });
        setPayAmount(due);
        setPayMode("cash");
        setShowPayModal(true);
    };

    const submitOutstandingPayment = async (e) => {
        e.preventDefault();
        if (!payAmount || payAmount <= 0 || payAmount > payData.due) {
            alert.error("Please enter a valid amount");
            return;
        }
        try {
            setIsPaying(true);
            const res = await apiRequest.post("usermembership/pay-outstanding", {
                invoice_id: payData.invoice_id,
                amount_paying: payAmount,
                payment_mode: payMode
            });
            if (res.status === "success") {
                alert.success("Payment successful!");
                setShowPayModal(false);
                fetchMemberships(); 
            } else {
                alert.error(res.message || "Payment Failed");
            }
        } catch (err) {
            alert.error(err?.response?.data?.message || "Error processing payment");
        } finally {
            setIsPaying(false);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await alert.confirm("Are you sure you want to delete?");
        if (!confirm) return;
        try {
            rootCtx[0](true);
            await apiRequest.delete(`usermembership/${id}`);
            alert.success("Deleted Successfully");
            fetchMemberships();
        } catch (err) {
            alert.error("Delete Failed");
        } finally {
            rootCtx[0](false);
        }
    };

    const filteredData = useMemo(() => {
        if (!search.trim()) return memberships;
        return memberships.filter((m) =>
            (m.member?.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (m.member?.email || "").toLowerCase().includes(search.toLowerCase()) ||
            (m.member?.mobile || "").includes(search)
        );
    }, [memberships, search]);

    const totalPages = Math.ceil(filteredData.length / recordsPerPage);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * recordsPerPage;
        return filteredData.slice(start, start + recordsPerPage);
    }, [filteredData, currentPage]);

    const getBase64Logo = () => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = logo;
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            };
        });
    };

    const generateInvoiceHTML = (data, logoBase64) => {
        const payments = data.InvoiceMaster?.Payments || [];
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const packagePrice = data.InvoiceMaster?.net_amount || data.membershipPackage?.selling_price || totalPaid;
        const dueAmount = packagePrice - totalPaid;
        const isFullyPaid = dueAmount <= 0;
        const invoiceNo = data.InvoiceMaster?.invoice_no || `INV-${data.id}-${Date.now()}`;

        const pkg = data.membershipPackage || data.MembershipPackage || {};
        const mrp = pkg.mrp ? pkg.mrp : packagePrice;
        const gstStatus = pkg.gst_status || "excluded";
        const gstPercent = pkg.gst_percentage || 0;

        const paymentRows = payments.length
            ? payments.map((p) => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-size: 14px; text-transform: capitalize;">${p.payment_mode}</td>
                <td style="padding: 12px; font-size: 14px; color: #666;">${p.payment_date}</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">₹${p.amount}</td>
            </tr>
        `).join("")
            : `<tr><td colspan="3" style="padding: 20px; text-align: center; color: #999;">No payments recorded</td></tr>`;

        return `
    <div style="width: 800px; margin: 20px auto; padding: 50px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fff; color: #333; border: 1px solid #e0e0e0; position: relative;">
        ${isFullyPaid ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 140px; color: rgba(76, 175, 80, 0.08); font-weight: 900; border: 15px solid rgba(76, 175, 80, 0.08); border-radius: 20px;">PAID</div>` : ""}
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div style="display: flex; align-items: center;">
                <img src="${logoBase64}" width="70" style="margin-right: 15px;"/>
                <div>
                    <h1 style="margin: 0; font-size: 28px;">OCTANE <span style="color: #e63946;">GYM</span></h1>
                    <p style="margin: 0; font-size: 12px; color: #666;">Elite Fitness & Performance</p>
                </div>
            </div>
            <div style="text-align: right;">
                <h2 style="margin: 0; font-size: 22px; color: #999;">INVOICE</h2>
                <p style="margin: 5px 0 0; font-size: 14px;"><strong>#</strong> ${invoiceNo}</p>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
            <div>
                <h4 style="color: #e63946; border-bottom: 1px solid #eee; padding-bottom: 5px;">Member Information</h4>
                <p style="margin: 0; font-weight: 600;">${data.member?.name || "N/A"}</p>
                <p style="margin: 4px 0;">${data.member?.email || "-"}</p>
                <p style="margin: 0;">+91 ${data.member?.mobile || "-"}</p>
            </div>
            <div>
                <h4 style="color: #e63946; border-bottom: 1px solid #eee; padding-bottom: 5px;">Plan Details</h4>
                <p style="margin: 0; font-weight: 600;">${pkg.name || "General Membership"}</p>
                <p style="margin: 4px 0;">Validity: ${data.start_at?.substring(0, 10)} to ${data.end_at?.substring(0, 10)}</p>
            </div>
        </div>

        <div style="margin-bottom: 30px;">
            <table width="100%" style="border-collapse: collapse;">
                <thead>
                    <tr style="background: #1a1a1a; color: white;">
                        <th style="padding: 12px; text-align: left;">Method</th>
                        <th style="padding: 12px; text-align: left;">Date</th>
                        <th style="padding: 12px; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>${paymentRows}</tbody>
            </table>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-bottom: 50px;">
            <div style="width: 300px;">
                <div style="display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; color: #555;">
                    <span>Package MRP:</span><span>₹${mrp}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; color: #555;">
                    <span>GST:</span>
                    <span>${gstStatus === 'included' ? `Included (${gstPercent}%)` : 'Excluded'}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 5px 0; margin-top: 5px; border-top: 1px dashed #ccc;">
                    <span>Total Net Amount:</span><span style="font-weight: bold;">₹${packagePrice}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 2px solid #eee;">
                    <span>Total Paid:</span><span style="color: #2e7d32; font-weight: bold;">₹${totalPaid}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 15px 0;">
                    <span style="font-weight: bold; font-size: 16px;">Balance Due:</span>
                    <span style="font-weight: bold; font-size: 18px; color: ${isFullyPaid ? '#2e7d32' : '#e63946'};">₹${dueAmount}</span>
                </div>
            </div>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 13px; color: #666;">
            <p style="margin: 0; margin-bottom: 5px;">If you have any questions regarding this invoice, please contact <strong>+91 6358051927</strong></p>
            <p style="margin: 0; font-size: 11px; color: #aaa; font-style: italic;">Generated via Octane Management System</p>
        </div>
        
    </div>
    `;
    };

    const handlePrint = async (data) => {
        const logoBase64 = await getBase64Logo();
        const printContent = generateInvoiceHTML(data, logoBase64);
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`<html><head><title>Invoice</title></head><body>${printContent}</body></html>`);
        printWindow.document.close();
        printWindow.onload = () => printWindow.print();
    };

    const handleDownloadPDF = async (data) => {
        const logoBase64 = await getBase64Logo();
        invoiceRef.current.innerHTML = generateInvoiceHTML(data, logoBase64);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save(`Invoice_${data.member?.name}.pdf`);
    };

    const handleWhatsApp = (data) => {
        const payments = data.InvoiceMaster?.Payments || [];
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const packagePrice = data.InvoiceMaster?.net_amount || data.membershipPackage?.selling_price || totalPaid;
        const dueAmount = packagePrice - totalPaid;
        const isFullyPaid = dueAmount <= 0;

        const mrp = data.membershipPackage?.mrp || packagePrice;
        const gstStatus = data.membershipPackage?.gst_status || "excluded";
        const gstPercent = data.membershipPackage?.gst_percentage || 0;
        const gstString = gstStatus === "included" ? `Included (${gstPercent}%)` : "Excluded";

        const paymentText = payments.length
            ? payments.map((p) => `- ${p.payment_mode.toUpperCase()} : Rs.${p.amount} (${p.payment_date})`).join("\n")
            : `- Full Payment : Rs.${totalPaid}`;

        const message = `
    *OCTANE GYM*
    ----------------------------
    *Membership Invoice*
    Member Name : ${data.member?.name}
    Package     : ${data.membershipPackage?.name}
    Validity    : ${data.start_at?.substring(0, 10)} to ${data.end_at?.substring(0, 10)}

    *Pricing Summary:*
    MRP         : Rs.${mrp}
    GST         : ${gstString}
    *Net Amount : Rs.${packagePrice}*

    *Payment Details:*
    ${paymentText}
    ----------------------------
    Total Paid  : Rs.${totalPaid}
    ${isFullyPaid ? "✅ *Status : PAID*" : "⚠️ *Due Amount : Rs." + dueAmount + "*"}

    Thank you for choosing Octane Gym.
    `;
        const phone = data.member?.mobile?.replace(/\D/g, "");
        if (!phone || phone.length !== 10) {
            alert.error("Invalid member mobile number");
            return;
        }
        window.open(`https://web.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(message)}`, "_blank");
    };

    const changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <Container>
            {/* HEADER */}
            <HeaderSection>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <PageTitle>
                        Memberships <span>/ Assigned</span>
                    </PageTitle>
                    <Sub>Manage active user subscriptions and payments</Sub>
                </div>
                
                <HeaderActions>
                    {/* ✅ REDESIGNED EXCEL EXPORT GROUP */}
                    <ExportGroup>
                        <DateGroup>
                            <i className="bi bi-calendar-range" />
                            <DateInput 
                                type="date" 
                                value={fromDate} 
                                onChange={(e) => setFromDate(e.target.value)} 
                                title="From Date"
                            />
                            <span className="separator">to</span>
                            <DateInput 
                                type="date" 
                                value={toDate} 
                                onChange={(e) => setToDate(e.target.value)} 
                                title="To Date"
                            />
                        </DateGroup>
                        <ExportBtn onClick={handleExportExcel}>
                            <i className="fa-solid fa-file-excel" />
                            Export
                        </ExportBtn>
                    </ExportGroup>

                    <InputWrapper>
                        <i className="bi bi-search" />
                        <Input
                            type="text"
                            placeholder="Search name, mobile..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </InputWrapper>
                    <AddBtn onClick={goToAddMembership}>
                        <i className="fa-solid fa-plus" style={{ marginRight: "6px" }} />
                        Add Membership
                    </AddBtn>
                </HeaderActions>
            </HeaderSection>

            {/* TABLE */}
            <TableCard>
                <Table>
                    <thead>
                        <tr>
                            <th width="50" className="text-center">#</th>
                            <th width="180">Name</th>
                            <th width="120">Mobile</th> {/* ✅ NEW MOBILE COLUMN */}
                            <th>Membership</th>
                            <th>Start</th>
                            <th>End</th>
                            <th width="100" className="text-center">Status</th>
                            <th className="text-end">Total Paid</th>
                            <th width="60" className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((m, index) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0); 
                                
                                const endDate = new Date(m.end_at);
                                endDate.setHours(0, 0, 0, 0);
                                
                                const isExpired = endDate < today;
                                const displayStatus = (isExpired && m.status === "active") ? "completed" : m.status;

                                return (
                                    <tr key={m.id}>
                                        <td className="text-center">
                                            {(currentPage - 1) * recordsPerPage + index + 1}
                                        </td>
                                        <td>
                                            <MemberName>{m.member?.name || "-"}</MemberName>
                                        </td>
                                        <td>
                                            {/* ✅ MOBILE NUMBER EXTRACTED HERE */}
                                            <MobileText><i className="bi bi-telephone-fill me-1" style={{fontSize:"0.75rem", color:"#9ca3af"}}/> {m.member?.mobile || "-"}</MobileText>
                                        </td>
                                        <td>
                                            <PackageBadge>{m.membershipPackage?.name || "-"}</PackageBadge>
                                        </td>
                                        <td>
                                            <DateText>{m.start_at?.substring(0, 10)}</DateText>
                                        </td>
                                        <td>
                                            <DateText>{m.end_at?.substring(0, 10)}</DateText>
                                        </td>
                                        <td className="text-center">
                                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                                                <Badge $variant={displayStatus === "active" ? "success" : displayStatus === "completed" ? "secondary" : "danger"}>
                                                    {displayStatus}
                                                </Badge>
                                                {m.InvoiceMaster?.payment_status === "partial" && (
                                                    <PartialBadge>Partial</PartialBadge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-end">
                                            <PaidAmount>₹ {m.amount_paid}</PaidAmount>
                                        </td>
                                        <td className="text-center">
                                            <ActionContainer>
                                                <MenuButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveActionId(activeActionId === m.id ? null : m.id);
                                                    }}
                                                >
                                                    <i className="bi bi-three-dots-vertical" />
                                                </MenuButton>

                                                {activeActionId === m.id && (
                                                    <ActionDropdown>
                                                        <DropdownItem onClick={() => {
                                                            setActiveActionId(null);
                                                            handlePrint(m);
                                                        }}>
                                                            <i className="fa-solid fa-print" style={{ color: "#64748b" }} /> 
                                                            Print Invoice
                                                        </DropdownItem>
                                                        
                                                        <DropdownItem onClick={() => {
                                                            setActiveActionId(null);
                                                            handleDownloadPDF(m);
                                                        }}>
                                                            <i className="fa-solid fa-file-pdf" style={{ color: "#3b82f6" }} /> 
                                                            Download PDF
                                                        </DropdownItem>
                                                        
                                                        <DropdownItem onClick={() => {
                                                            setActiveActionId(null);
                                                            handleWhatsApp(m);
                                                        }}>
                                                            <i className="fa-brands fa-whatsapp" style={{ color: "#10b981" }} /> 
                                                            Send WhatsApp
                                                        </DropdownItem>

                                                        {(m.InvoiceMaster?.payment_status === "partial" || m.InvoiceMaster?.payment_status === "unpaid") && (
                                                            <>
                                                                <Divider />
                                                                <DropdownItem $highlight onClick={() => {
                                                                    setActiveActionId(null);
                                                                    openPayModal(m);
                                                                }}>
                                                                    <i className="bi bi-cash-coin" style={{ color: "#d97706" }} /> 
                                                                    Pay Remaining Due
                                                                </DropdownItem>
                                                            </>
                                                        )}

                                                        <Divider />
                                                        <DropdownItem className="delete" onClick={() => {
                                                            setActiveActionId(null);
                                                            handleDelete(m.id);
                                                        }}>
                                                            <i className="fa-solid fa-trash" style={{ color: "#ef4444" }} /> 
                                                            Delete Record
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
                                <td colSpan="9"> {/* ✅ UPDATED COLSPAN TO 9 */}
                                    <EmptyState>
                                        <div className="icon-box">
                                            <i className="bi bi-person-vcard" />
                                        </div>
                                        <h6>No Memberships Found</h6>
                                        <p>Try adjusting your search criteria or add a new membership.</p>
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

            <UserMembershipModal show={showModal} handleClose={() => setShowModal(false)} onSuccess={fetchMemberships} editData={selectedData} />

            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                <div ref={invoiceRef}></div>
            </div>

            {/* Outstanding Payment Modal */}
            {showPayModal && (
                <ModalOverlay onClick={() => setShowPayModal(false)}>
                    <ModalBox onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <h5><i className="bi bi-cash-coin me-2"></i> Pay Outstanding Balance</h5>
                            <button type="button" onClick={() => setShowPayModal(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </ModalHeader>
                        <form onSubmit={submitOutstandingPayment}>
                            <ModalBody>
                                <SummaryRow>
                                    <span className="label">Member Name:</span>
                                    <span className="value">{payData?.membership?.member?.name}</span>
                                </SummaryRow>
                                <SummaryRow>
                                    <span className="label">Total Package Cost:</span>
                                    <span className="value">₹ {payData?.totalAmount}</span>
                                </SummaryRow>
                                <SummaryRow $danger>
                                    <span className="label">Due Amount:</span>
                                    <span className="value fs-large">₹ {payData?.due}</span>
                                </SummaryRow>

                                <FormGroup>
                                    <FormLabel>Enter Amount to Pay (₹)</FormLabel>
                                    <FormInput
                                        type="number"
                                        value={payAmount}
                                        onChange={(e) => setPayAmount(e.target.value)}
                                        max={payData?.due}
                                        min="1"
                                        required
                                    />
                                    <FormHint>You can pay partially or in full.</FormHint>
                                </FormGroup>

                                <FormGroup>
                                    <FormLabel>Payment Mode</FormLabel>
                                    <FormSelect
                                        value={payMode}
                                        onChange={(e) => setPayMode(e.target.value)}
                                    >
                                        <option value="cash">💵 Cash</option>
                                        <option value="upi">📱 UPI</option>
                                        <option value="card">💳 Card</option>
                                    </FormSelect>
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <CancelBtn type="button" onClick={() => setShowPayModal(false)}>Cancel</CancelBtn>
                                <SubmitBtn type="submit" disabled={isPaying}>
                                    {isPaying ? "Processing..." : "Submit Payment"}
                                </SubmitBtn>
                            </ModalFooter>
                        </form>
                    </ModalBox>
                </ModalOverlay>
            )}
        </Container>
    );
}

// ────────────────────────────────────────────────────────────────────────────
//  Styled Components
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

// ===============================
// ✅ REDESIGNED EXPORT GROUP
// ===============================
const ExportGroup = styled.div`
  display: flex;
  align-items: stretch;
  background: var(--white);
  border: 1px solid var(--border2);
  border-radius: var(--r1);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const DateGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: var(--bg);
  
  i {
    color: var(--tm);
    font-size: 0.95rem;
  }
  
  .separator {
    font-size: 0.8rem;
    color: var(--tm);
    font-weight: 700;
  }
`;

const DateInput = styled.input`
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--tb);
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 8px 0;

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.5;
    transition: 0.2s;
  }
  &::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }
`;

const ExportBtn = styled.button`
  background: #10b981; /* Premium Emerald Green */
  color: var(--white);
  border: none;
  padding: 0 18px;
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #059669;
  }
`;

// ===============================
// CONTINUED STYLES
// ===============================

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

const TableCard = styled.div`
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
  overflow-y: visible;
  
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 950px; /* Thoda increase kiya for extra column */

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

const MemberName = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--th);
  text-transform: capitalize;
`;

// ✅ NEW STYLED COMPONENT FOR MOBILE COLUMN
const MobileText = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--tb);
  display: flex;
  align-items: center;
`;

const PackageBadge = styled.span`
  display: inline-flex;
  padding: 4px 10px;
  background: var(--grad-soft);
  color: var(--g1);
  font-size: 0.75rem;
  font-weight: 800;
  border-radius: var(--r1);
`;

const DateText = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--tb);
`;

const PaidAmount = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: #16a34a;
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
      case "secondary":
        return "background: #f1f5f9; color: #64748b;";
      default:
        return "background: var(--bg); color: var(--tm); border: 1px solid var(--border2);";
    }
  }}
`;

const PartialBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  background: #fef3c7;
  color: #d97706;
`;

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
  min-width: 180px;
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
  gap: 10px;
  transition: 0.2s;

  ${({ $highlight }) => $highlight && `
    background: #fef3c7;
    color: #d97706;
  `}

  i { font-size: 0.95rem; width: 16px; text-align: center; }

  &:hover { 
    background: ${({ $highlight }) => $highlight ? "#fde68a" : "var(--bg)"}; 
    color: ${({ $highlight }) => $highlight ? "#d97706" : "var(--th)"}; 
  }

  &.delete:hover {
    background: #fef2f2;
    color: #ef4444;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border2);
  margin: 4px 0;
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

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(13, 11, 30, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalBox = styled.div`
  background: var(--white);
  border-radius: var(--r3);
  width: 100%;
  max-width: 450px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: slideUp 0.3s ease-out forwards;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const ModalHeader = styled.div`
  background: #fef3c7; 
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #fde68a;

  h5 {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 1.05rem;
    font-weight: 800;
    color: #b45309;
    display: flex;
    align-items: center;
  }

  button {
    background: transparent;
    border: none;
    color: #b45309;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0.7;
    transition: 0.2s;
    &:hover { opacity: 1; }
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border);

  .label {
    font-family: var(--font-ui);
    font-size: 0.85rem;
    color: var(--tm);
    font-weight: 600;
  }

  .value {
    font-family: var(--font-ui);
    font-size: 0.95rem;
    color: var(--th);
    font-weight: 800;
  }

  ${({ $danger }) => $danger && `
    border-bottom: none;
    margin-bottom: 20px;
    .label, .value { color: #dc2626; }
    .fs-large { font-size: 1.2rem; }
  `}
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--th);
`;

const FormInput = styled.input`
  width: 100%;
  font-family: var(--font-ui);
  font-size: 1rem;
  font-weight: 700;
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

const FormSelect = styled.select`
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
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    background: var(--white);
    border-color: var(--g2);
    box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1);
  }
`;

const FormHint = styled.small`
  font-family: var(--font-ui);
  font-size: 0.75rem;
  color: var(--tm);
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  background: var(--bg);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CancelBtn = styled.button`
  background: var(--white);
  border: 1px solid var(--border2);
  color: var(--tb);
  padding: 10px 18px;
  border-radius: var(--r1);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: var(--border);
  }
`;

const SubmitBtn = styled.button`
  background: #16a34a;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: var(--r1);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);

  &:hover:not(:disabled) {
    background: #15803d;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;