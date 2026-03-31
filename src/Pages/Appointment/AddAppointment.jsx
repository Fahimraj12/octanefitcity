import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";
import { rootContext } from "../../App";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Inject custom styles for react-datepicker to match the design system
const DatePickerStyles = createGlobalStyle`
  .custom-datepicker-wrapper {
    width: 100%;
  }
  .custom-datepicker-wrapper .react-datepicker__input-container input {
    width: 100%;
    font-family: var(--font-ui, "Outfit", sans-serif);
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--th, #0d0b1e);
    background: #ffffff;
    border: 1px solid var(--border2, #ddd8ee);
    border-radius: var(--r1, 8px);
    padding: 10px 14px;
    transition: all 0.2s ease;
    outline: none;
  }
  .custom-datepicker-wrapper .react-datepicker__input-container input:focus {
    border-color: var(--g2, #ff4a6e);
    box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1);
  }
  .custom-datepicker-wrapper .react-datepicker__input-container input.is-invalid {
    border-color: #fc8181;
  }
`;

export default function AddAppointment() {
  const rootCtx = useContext(rootContext);
  const setLoading = rootCtx[0];
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  const allSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
  ];

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.short_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [memRes, pkgRes] = await Promise.all([
          apiRequest.get("member/get-member"),
          apiRequest.get("package/"),
        ]);
        if (memRes.status?.toUpperCase() === "SUCCESS")
          setMembers(memRes.result);
        if (pkgRes.status?.toUpperCase() === "SUCCESS")
          setPackages(pkgRes.result);
      } catch (err) {
        alert.error("Initialization failed");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      package_id: "",
      member_id: "",
      member_phone: "",
      member_email: "",
      date: "",
      slot: "",
      amount: "",
      payment_status: "pending",
    },
    validationSchema: Yup.object({
      package_id: Yup.string().required("Please select a package"),
      member_id: Yup.string().required("Member selection is required"),
      date: Yup.string().required("Date is required"),
      slot: Yup.string().required("Time slot is required"),
      amount: Yup.number().required("Amount is required"),
      payment_status: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const res = await apiRequest.post("appointment/add-appointment", values);
        if (res.status?.toUpperCase() === "SUCCESS") {
          alert.success("Appointment Booked!");
          navigate("/Admin/Appointment");
        } else {
          alert.error(res.result);
        }
      } catch (err) {
        alert.error("Server Error");
      } finally {
        setLoading(false);
      }
    },
  });

  // Handle Member Selection Logic
  useEffect(() => {
    const selected = members.find((m) => m.id == formik.values.member_id);
    if (selected) {
      formik.setFieldValue("member_phone", selected.mobile);
      formik.setFieldValue("member_email", selected.email);
    }
  }, [formik.values.member_id]);

  // Fetch Booked Slots
  useEffect(() => {
    if (formik.values.date) {
      const fetchSlots = async () => {
        const res = await apiRequest.get(
          `appointment/booked-slots?date=${formik.values.date}`
        );
        if (res.status?.toUpperCase() === "SUCCESS")
          setBookedSlots(res.result);
      };
      fetchSlots();
    }
  }, [formik.values.date]);

  // Helper for errors
  const renderError = (field) =>
    formik.touched[field] && formik.errors[field] ? (
      <ErrorMessage>{formik.errors[field]}</ErrorMessage>
    ) : null;

  return (
    <>
      <DatePickerStyles />
      <PageContainer>
        <HeaderRow>
          <BackButton onClick={() => navigate(-1)}>
            <i className="fa-solid fa-arrow-left" />
          </BackButton>
          <PageTitle>Create New Appointment</PageTitle>
        </HeaderRow>

        <GridLayout>
          {/* FORM SECTION */}
          <MainCard>
            <form onSubmit={formik.handleSubmit}>
              <FormGrid>
                {/* MEMBER SELECTION */}
                <FormGroup className="span-12">
                  <Label>Member Information</Label>
                  <Select
                    $hasError={formik.touched.member_id && formik.errors.member_id}
                    {...formik.getFieldProps("member_id")}
                  >
                    <option value="">Select Member</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.mobile})
                      </option>
                    ))}
                  </Select>
                  {renderError("member_id")}
                </FormGroup>

                {/* PACKAGE DROPDOWN */}
                <FormGroup className="span-12" style={{ position: "relative" }}>
                  <Label>Service / Package</Label>
                  <CustomSelectTrigger
                    $hasError={
                      formik.touched.package_id && formik.errors.package_id
                    }
                    onClick={() => setShowPackageDropdown(!showPackageDropdown)}
                  >
                    <span
                      className={selectedPackage ? "text-dark" : "text-muted"}
                    >
                      {selectedPackage
                        ? selectedPackage.title
                        : "Choose a training package..."}
                    </span>
                    <i
                      className={`fa-solid fa-chevron-${
                        showPackageDropdown ? "up" : "down"
                      } small text-muted`}
                    />
                  </CustomSelectTrigger>
                  {renderError("package_id")}

                  {showPackageDropdown && (
                    <DropdownMenu>
                      <DropdownSearch>
                        <Input
                          type="text"
                          placeholder="Search packages..."
                          onChange={(e) => setSearchTerm(e.target.value)}
                          autoFocus
                        />
                      </DropdownSearch>
                      <DropdownList>
                        {filteredPackages.map((pkg) => (
                          <PackageOption
                            key={pkg.id}
                            onClick={() => {
                              formik.setFieldValue("package_id", pkg.id);
                              formik.setFieldValue("amount", pkg.selling_price);
                              setSelectedPackage(pkg);
                              setShowPackageDropdown(false);
                            }}
                          >
                            <PkgInfo>
                              <PkgTitle>{pkg.title}</PkgTitle>
                              <PkgDesc>{pkg.short_description}</PkgDesc>
                            </PkgInfo>
                            <PkgPricing>
                              <PkgPrice>₹{pkg.mrp_price}</PkgPrice>
                              <PkgDiscount>
                                Disc: ₹
                                {parseFloat(pkg.discount_price) > 0
                                  ? pkg.discount_price
                                  : "0.00"}
                              </PkgDiscount>
                            </PkgPricing>
                          </PackageOption>
                        ))}
                        {filteredPackages.length === 0 && (
                          <NoResults>No packages found.</NoResults>
                        )}
                      </DropdownList>
                    </DropdownMenu>
                  )}
                </FormGroup>

                {/* DATE & TIME */}
                <FormGroup className="span-6">
                  <Label>Select Date</Label>
                  <div className="custom-datepicker-wrapper">
                    <DatePicker
                      selected={
                        formik.values.date ? new Date(formik.values.date) : null
                      }
                      onChange={(date) =>
                        formik.setFieldValue(
                          "date",
                          date.toISOString().split("T")[0]
                        )
                      }
                      minDate={new Date()}
                      className={
                        formik.touched.date && formik.errors.date
                          ? "is-invalid"
                          : ""
                      }
                      placeholderText="YYYY-MM-DD"
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                  {renderError("date")}
                </FormGroup>

                <FormGroup className="span-6">
                  <Label>Time Slot</Label>
                  <Select
                    $hasError={formik.touched.slot && formik.errors.slot}
                    {...formik.getFieldProps("slot")}
                  >
                    <option value="">Choose Slot</option>
                    {allSlots.map((slot) => (
                      <option
                        key={slot}
                        value={slot}
                        disabled={bookedSlots.includes(slot)}
                      >
                        {slot} {bookedSlots.includes(slot) ? "— [Booked]" : ""}
                      </option>
                    ))}
                  </Select>
                  {renderError("slot")}
                </FormGroup>

                {/* AMOUNT & PAYMENT */}
                <FormGroup className="span-6">
                  <Label>Amount</Label>
                  <InputGroup
                    $hasError={formik.touched.amount && formik.errors.amount}
                  >
                    <Prefix>₹</Prefix>
                    <GroupInput
                      type="number"
                      {...formik.getFieldProps("amount")}
                      readOnly
                    />
                  </InputGroup>
                  {renderError("amount")}
                </FormGroup>

                <FormGroup className="span-6">
                  <Label>Payment Status</Label>
                  <Select
                    $hasError={
                      formik.touched.payment_status && formik.errors.payment_status
                    }
                    {...formik.getFieldProps("payment_status")}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </Select>
                  {renderError("payment_status")}
                </FormGroup>

                {/* SUBMIT BUTTON */}
                <FormGroup className="span-12" style={{ marginTop: "12px" }}>
                  <SubmitBtn type="submit">
                    Confirm Appointment
                  </SubmitBtn>
                </FormGroup>
              </FormGrid>
            </form>
          </MainCard>

          {/* PREVIEW SECTION */}
          <SummaryCard>
            <SummaryHeader>
              <SummaryTitle>Booking Summary</SummaryTitle>
            </SummaryHeader>
            <SummaryBody>
              {selectedPackage ? (
                <SummaryContent>
                  <PkgHighlightBox>
                    <Badge>Selected Package</Badge>
                    <HighlightTitle>{selectedPackage.title}</HighlightTitle>
                    <HighlightDesc>
                      {selectedPackage.short_description}
                    </HighlightDesc>
                  </PkgHighlightBox>

                  <SummaryList>
                    <SummaryRow>
                      <RowLabel>Sessions</RowLabel>
                      <RowValue>{selectedPackage.sessions}</RowValue>
                    </SummaryRow>
                    <SummaryRow>
                      <RowLabel>Duration</RowLabel>
                      <RowValue>{selectedPackage.duration_in_days} Days</RowValue>
                    </SummaryRow>

                    {parseFloat(selectedPackage.discount_price) > 0 && (
                      <SummaryRow>
                        <RowLabel>Standard Rate</RowLabel>
                        <RowValueStrike>₹{selectedPackage.mrp_price}</RowValueStrike>
                      </SummaryRow>
                    )}

                    <SummaryRow>
                      <RowLabel>Discount</RowLabel>
                      <RowValueSuccess>
                        - ₹
                        {parseFloat(selectedPackage.discount_price) > 0
                          ? selectedPackage.discount_price
                          : "0.00"}
                      </RowValueSuccess>
                    </SummaryRow>

                    <TotalRow>
                      <TotalLabel>Total Payable</TotalLabel>
                      <TotalValue>
                        ₹{formik.values.amount || "0.00"}
                      </TotalValue>
                    </TotalRow>
                  </SummaryList>
                </SummaryContent>
              ) : (
                <EmptyState>
                  <i className="fa-solid fa-receipt icon" />
                  <p>Select a package to see details</p>
                </EmptyState>
              )}
            </SummaryBody>
          </SummaryCard>
        </GridLayout>
      </PageContainer>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Styled Components
// ────────────────────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  font-family: var(--font-ui, "Outfit", sans-serif);
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  background: var(--white, #fff);
  border: 1px solid var(--border, #ede9f5);
  color: var(--tb, #35304f);
  width: 40px;
  height: 40px;
  border-radius: var(--r2, 12px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: var(--shadow-sm);

  &:hover {
    border-color: var(--border2, #ddd8ee);
    color: var(--g1, #ff6b2b);
    transform: translateX(-2px);
  }
`;

const PageTitle = styled.h3`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--th, #0d0b1e);
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const CardBase = styled.div`
  background: var(--white, #ffffff);
  border-radius: var(--r3, 18px);
  box-shadow: var(--shadow-md, 0 6px 28px rgba(20, 5, 60, 0.09));
  overflow: hidden;
  animation: ${fadeUp} 0.3s ease forwards;
`;

const MainCard = styled(CardBase)`
  padding: 30px;
  @media (max-width: 768px) { padding: 20px; }
`;

/* ── Form Elements ── */
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;

  .span-12 { grid-column: span 12; }
  .span-6 { grid-column: span 6; }

  @media (max-width: 768px) {
    .span-6 { grid-column: span 12; }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--tb, #35304f);
  margin: 0;
`;

const ErrorMessage = styled.span`
  font-size: 0.75rem;
  color: #e53e3e;
  font-weight: 500;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: "!";
    display: inline-block;
    background: #fff5f5;
    color: #e53e3e;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    text-align: center;
    line-height: 14px;
    font-size: 0.65rem;
    font-weight: bold;
    border: 1px solid #fc8181;
  }
`;

const inputStyles = `
  width: 100%;
  font-family: var(--font-ui, "Outfit", sans-serif);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--th, #0d0b1e);
  background: #ffffff;
  border-radius: var(--r1, 8px);
  padding: 10px 14px;
  transition: all 0.2s ease;
  outline: none;

  &::placeholder {
    color: var(--tm, #9490aa);
    opacity: 0.6;
  }

  &:focus {
    border-color: var(--g2, #ff4a6e);
    box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1);
  }
`;

const Input = styled.input`
  ${inputStyles}
  border: 1px solid ${({ $hasError }) => ($hasError ? "#fc8181" : "var(--border2, #ddd8ee)")};
`;

const Select = styled.select`
  ${inputStyles}
  border: 1px solid ${({ $hasError }) => ($hasError ? "#fc8181" : "var(--border2, #ddd8ee)")};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239490aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 14px;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: stretch;
  border: 1px solid ${({ $hasError }) => ($hasError ? "#fc8181" : "var(--border2, #ddd8ee)")};
  border-radius: var(--r1, 8px);
  overflow: hidden;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: var(--g2, #ff4a6e);
    box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1);
  }
`;

const Prefix = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: var(--bg, #f7f7fb);
  color: var(--tb, #35304f);
  font-weight: 700;
  font-size: 0.95rem;
  border-right: 1px solid var(--border2, #ddd8ee);
`;

const GroupInput = styled.input`
  ${inputStyles}
  border: none !important;
  border-radius: 0;
  box-shadow: none !important;
  flex: 1;
`;

const SubmitBtn = styled.button`
  background: var(--grad, linear-gradient(135deg, #ff6b2b 0%, #ff4a6e 50%, #c026d3 100%));
  color: #ffffff;
  border: none;
  font-family: var(--font-ui, "Outfit", sans-serif);
  font-weight: 700;
  font-size: 1rem;
  padding: 14px;
  border-radius: var(--r2, 12px);
  cursor: pointer;
  width: 100%;
  box-shadow: 0 4px 14px rgba(255, 74, 110, 0.25);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(255, 74, 110, 0.35);
    transform: translateY(-2px);
  }
`;

/* ── Custom Package Dropdown ── */
const CustomSelectTrigger = styled.div`
  ${inputStyles}
  border: 1px solid ${({ $hasError }) => ($hasError ? "#fc8181" : "var(--border2, #ddd8ee)")};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  .text-dark { color: var(--th, #0d0b1e); font-weight: 600; }
  .text-muted { color: var(--tm, #9490aa); opacity: 0.8; }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2, 12px);
  box-shadow: var(--shadow-lg);
  z-index: 10;
  overflow: hidden;
  animation: ${fadeUp} 0.2s ease;
`;

const DropdownSearch = styled.div`
  padding: 10px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
`;

const DropdownList = styled.div`
  max-height: 260px;
  overflow-y: auto;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
`;

const PackageOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;

  &:last-child { border-bottom: none; }
  &:hover { background: var(--grad-hover, rgba(255,107,43,0.05)); }
`;

const PkgInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const PkgTitle = styled.span`
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--th);
`;

const PkgDesc = styled.span`
  font-size: 0.75rem;
  color: var(--tm);
`;

const PkgPricing = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
`;

const PkgPrice = styled.span`
  font-weight: 700;
  color: var(--th);
  font-size: 0.95rem;
`;

const PkgDiscount = styled.span`
  font-size: 0.7rem;
  color: #38a169;
  font-weight: 600;
`;

const NoResults = styled.div`
  padding: 16px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--tm);
`;

/* ── Summary Section ── */
const SummaryCard = styled(CardBase)`
  background: var(--bg, #f7f7fb);
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SummaryHeader = styled.div`
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--border, #ede9f5);
`;

const SummaryTitle = styled.h5`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--th, #0d0b1e);
`;

const SummaryBody = styled.div`
  padding: 24px;
  flex: 1;
`;

const SummaryContent = styled.div`
  animation: ${fadeUp} 0.3s ease;
`;

const PkgHighlightBox = styled.div`
  background: var(--white);
  padding: 18px;
  border-radius: var(--r2, 12px);
  box-shadow: 0 2px 12px rgba(20,5,60,0.04);
  margin-bottom: 20px;
  border: 1px solid var(--border);
`;

const Badge = styled.span`
  display: inline-block;
  background: var(--grad-soft, rgba(255,107,43,0.1));
  color: var(--g3, #c026d3);
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 10px;
`;

const HighlightTitle = styled.h4`
  margin: 0 0 4px;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--th);
`;

const HighlightDesc = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: var(--tm);
  line-height: 1.4;
`;

const SummaryList = styled.div`
  background: var(--white);
  border-radius: var(--r2, 12px);
  box-shadow: 0 2px 12px rgba(20,5,60,0.04);
  border: 1px solid var(--border);
  overflow: hidden;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
`;

const RowLabel = styled.span`
  color: var(--tb);
  font-weight: 500;
`;

const RowValue = styled.span`
  font-weight: 700;
  color: var(--th);
`;

const RowValueStrike = styled(RowValue)`
  text-decoration: line-through;
  color: #e53e3e;
  font-size: 0.85rem;
`;

const RowValueSuccess = styled(RowValue)`
  color: #38a169;
`;

const TotalRow = styled(SummaryRow)`
  background: var(--bg);
  border-bottom: none;
  padding: 18px;
`;

const TotalLabel = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: var(--th);
`;

const TotalValue = styled.span`
  font-size: 1.3rem;
  font-weight: 900;
  background: var(--grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 250px;
  text-align: center;
  color: var(--tm);

  .icon {
    font-size: 3rem;
    opacity: 0.2;
    margin-bottom: 16px;
  }
  p {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 500;
  }
`;