import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled, { keyframes } from "styled-components";
import { rootContext } from "../../App";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";

export default function UserMembershipModal({
  show,
  handleClose,
  onSuccess,
  editData,
}) {
  const rootCtx = useContext(rootContext);

  // All states together at top
  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberFilterText, setMemberFilterText] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);

  const membershipSchema = Yup.object({
    member_id: Yup.string().required("Required"),
    membershippackage_id: Yup.string().required("Required"),
    status: Yup.string().required("Required"),
    start_at: Yup.date().required("Required"),
    end_at: Yup.date()
      .min(Yup.ref("start_at"), "End date must be after start date")
      .required("Required"),
    amount_paid: Yup.number().required("Required"),
    payment_method: Yup.string().required("Required"),
    trainer_assigned: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      member_id: "",
      email: "",
      mobile: "",
      membershippackage_id: "",
      status: "active",
      start_at: "",
      end_at: "",
      amount_paid: "",
      payment_method: "cash",
      trainer_assigned: "no",
    },
    validationSchema: membershipSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        rootCtx[0](true);

        let response;

        if (editData) {
          response = await apiRequest.put(
            `usermembership/update-user-membership/${editData.id}`,
            values
          );
        } else {
          response = await apiRequest.post(
            `usermembership/add-user-membership`,
            values
          );
        }

        if (response.status?.toUpperCase() === "SUCCESS") {
          alert.success(
            editData
              ? "Membership Updated Successfully"
              : "Membership Added Successfully",
            "Octane GYM"
          );

          resetForm();
          handleClose();
          onSuccess();
        } else {
          alert.error(response.result);
        }
      } catch (error) {
        alert.error(error?.response?.data?.result || "Something went wrong");
      } finally {
        rootCtx[0](false);
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const memberRes = await apiRequest.get("member/get-member");
        const packageRes = await apiRequest.get(
          "membershippackage/get-membershippackages"
        );

        if (memberRes.status === "success") {
          setMembers(memberRes.result || []);
        }

        if (packageRes.status === "success") {
          setPackages(packageRes.result || []);
        }
      } catch (err) {
        console.log("Dropdown fetch error:", err);
      }
    };

    fetchDropdownData();
  }, []);

  // ✅ FIXED: Separate useEffect for editData population
  useEffect(() => {
    if (editData && (members.length > 0 || packages.length > 0)) {
      formik.setValues({
        member_id: editData.member_id || "",
        email: editData.email || "",
        mobile: editData.mobile || "",
        membershippackage_id: editData.membershippackage_id || "",
        status: editData.status || "active",
        start_at: editData.start_at?.substring(0, 10) || "",
        end_at: editData.end_at?.substring(0, 10) || "",
        amount_paid: editData.amount_paid || "",
        payment_method: editData.payment_method || "cash",
        trainer_assigned: editData.trainer_assigned || "no",
      });

      // Set selected member
      const memberData = members.find(
        (m) => m.id.toString() === editData.member_id
      );
      if (memberData) setSelectedMember(memberData);

      // Set selected package
      const packageData = packages.find(
        (p) => p.id.toString() === editData.membershippackage_id
      );
      if (packageData) setSelectedPackage(packageData);
    }
  }, [editData, members, packages]);

  // Automatically update email/mobile when member changes
  useEffect(() => {
    if (formik.values.member_id) {
      const selected = members.find(
        (m) => m.id.toString() === formik.values.member_id.toString()
      );
      if (selected) {
        formik.setFieldValue("email", selected.email || "");
        formik.setFieldValue("mobile", selected.mobile || "");
      }
    }
  }, [formik.values.member_id, members]);

  if (!show) return null;

  // Helper to render error messages
  const renderError = (field) =>
    formik.touched[field] && formik.errors[field] ? (
      <ErrorMessage>{formik.errors[field]}</ErrorMessage>
    ) : null;

  return (
    <Overlay>
      <ModalWrapper>
        <ModalContent>
          <ModalHeader>
            <HeaderTitle>
              <TitleIcon
                className={
                  editData ? "bi bi-person-lines-fill" : "bi bi-person-badge-fill"
                }
              />
              <TitleText>
                {editData ? "Edit User Membership" : "Assign New Membership"}
              </TitleText>
            </HeaderTitle>
            <CloseButton type="button" onClick={handleClose}>
              <i className="bi bi-x-lg" />
            </CloseButton>
          </ModalHeader>

          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <FormGrid>
                {/* ── MEMBER SELECTION ── */}
                <SectionHeader className="span-12">
                  <i className="bi bi-person-circle me-2" />
                  Member Information
                </SectionHeader>

                <FormGroup className="span-12">
                  <Label>Select Member</Label>
                  <Select
                    $hasError={formik.touched.member_id && formik.errors.member_id}
                    {...formik.getFieldProps("member_id")}
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.mobile})
                      </option>
                    ))}
                  </Select>
                  {renderError("member_id")}
                </FormGroup>

                <FormGroup className="span-6">
                  <Label>Member Email</Label>
                  <Input
                    type="email"
                    placeholder="Auto-filled"
                    {...formik.getFieldProps("email")}
                    readOnly
                    disabled
                  />
                </FormGroup>

                <FormGroup className="span-6">
                  <Label>Member Mobile</Label>
                  <Input
                    type="text"
                    placeholder="Auto-filled"
                    {...formik.getFieldProps("mobile")}
                    readOnly
                    disabled
                  />
                </FormGroup>

                <Divider className="span-12" />

                {/* ── PACKAGE SELECTION ── */}
                <SectionHeader className="span-12">
                  <i className="bi bi-box-seam me-2" />
                  Package Details
                </SectionHeader>

                <FormGroup className="span-12" style={{ position: "relative" }}>
                  <Label>
                    Membership Package{" "}
                    <small style={{ color: "var(--tm)", fontWeight: 500 }}>
                      (Click to change)
                    </small>
                  </Label>

                  {selectedPackage ? (
                    <SelectedPackageCard
                      onClick={() => setShowPackageDropdown(true)}
                    >
                      <PkgInfo>
                        <PkgTitle>
                          {selectedPackage.title || selectedPackage.name}
                        </PkgTitle>
                        <PkgDesc>
                          {selectedPackage.description || "No description provided."}
                        </PkgDesc>
                      </PkgInfo>
                      <PkgAction>
                        <Badge>
                          ₹{selectedPackage.selling_price || selectedPackage.price}
                        </Badge>
                        <i className="bi bi-pencil-square" />
                      </PkgAction>
                    </SelectedPackageCard>
                  ) : (
                    <CustomSelectTrigger
                      $hasError={
                        formik.touched.membershippackage_id &&
                        formik.errors.membershippackage_id
                      }
                      onClick={() => setShowPackageDropdown(true)}
                    >
                      <span className="text-muted">
                        Select Membership Package
                      </span>
                      <i className="bi bi-chevron-down small text-muted" />
                    </CustomSelectTrigger>
                  )}
                  {renderError("membershippackage_id")}

                  {showPackageDropdown && (
                    <>
                      <DropdownOverlay
                        onClick={() => {
                          setShowPackageDropdown(false);
                          setFilterText("");
                        }}
                      />
                      <DropdownMenu>
                        <DropdownSearch>
                          <i className="bi bi-search" />
                          <Input
                            type="text"
                            placeholder="Filter by name, description, price..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            autoFocus
                          />
                          {filterText && (
                            <ClearBtn
                              type="button"
                              onClick={() => setFilterText("")}
                            >
                              <i className="bi bi-x" />
                            </ClearBtn>
                          )}
                        </DropdownSearch>

                        <DropdownList>
                          <Table>
                            <thead>
                              <tr>
                                <th>Select</th>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {packages
                                .filter((pkg) => {
                                  const search = filterText.toLowerCase();
                                  return (
                                    pkg.id.toString().includes(search) ||
                                    (pkg.title || pkg.name || "")
                                      .toLowerCase()
                                      .includes(search) ||
                                    (pkg.description || "")
                                      .toLowerCase()
                                      .includes(search) ||
                                    (pkg.selling_price || pkg.price || "")
                                      .toString()
                                      .includes(search)
                                  );
                                })
                                .map((pkg) => {
                                  const isSelected =
                                    pkg.id ===
                                    parseInt(
                                      formik.values.membershippackage_id
                                    );
                                  return (
                                    <tr
                                      key={pkg.id}
                                      className={isSelected ? "selected" : ""}
                                      onClick={() => {
                                        formik.setFieldValue(
                                          "membershippackage_id",
                                          pkg.id
                                        );
                                        formik.setFieldValue(
                                          "amount_paid",
                                          pkg.selling_price || pkg.price || 0
                                        );
                                        setSelectedPackage(pkg);
                                        setShowPackageDropdown(false);
                                        setFilterText("");
                                      }}
                                    >
                                      <td>
                                        <i
                                          className={`bi bi-${
                                            isSelected
                                              ? "check-circle-fill text-primary"
                                              : "circle text-muted"
                                          }`}
                                        />
                                      </td>
                                      <td>{pkg.id}</td>
                                      <td className="fw-bold">
                                        {pkg.title || pkg.name}
                                      </td>
                                      <td>{pkg.description || "-"}</td>
                                      <td className="fw-bold text-success">
                                        ₹{pkg.selling_price || pkg.price}
                                      </td>
                                    </tr>
                                  );
                                })}

                              {packages.filter((pkg) => {
                                const search = filterText.toLowerCase();
                                return (
                                  pkg.id.toString().includes(search) ||
                                  (pkg.title || pkg.name || "")
                                    .toLowerCase()
                                    .includes(search) ||
                                  (pkg.description || "")
                                    .toLowerCase()
                                    .includes(search) ||
                                  (pkg.selling_price || pkg.price || "")
                                    .toString()
                                    .includes(search)
                                );
                              }).length === 0 && filterText ? (
                                <tr>
                                  <td
                                    colSpan="5"
                                    className="text-center text-muted py-4"
                                  >
                                    No packages match "{filterText}"
                                  </td>
                                </tr>
                              ) : null}
                            </tbody>
                          </Table>
                        </DropdownList>
                      </DropdownMenu>
                    </>
                  )}
                </FormGroup>

                <Divider className="span-12" />

                {/* ── ADDITIONAL DETAILS ── */}
                <SectionHeader className="span-12">
                  <i className="bi bi-card-checklist me-2" />
                  Additional Details
                </SectionHeader>

                <FormGroup className="span-4">
                  <Label>Status</Label>
                  <Select
                    $hasError={formik.touched.status && formik.errors.status}
                    {...formik.getFieldProps("status")}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                  {renderError("status")}
                </FormGroup>

                <FormGroup className="span-4">
                  <Label>Payment Method</Label>
                  <Select
                    $hasError={
                      formik.touched.payment_method &&
                      formik.errors.payment_method
                    }
                    {...formik.getFieldProps("payment_method")}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                  </Select>
                  {renderError("payment_method")}
                </FormGroup>

                <FormGroup className="span-4">
                  <Label>Amount Paid (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    $hasError={
                      formik.touched.amount_paid && formik.errors.amount_paid
                    }
                    {...formik.getFieldProps("amount_paid")}
                  />
                  {renderError("amount_paid")}
                </FormGroup>

                <FormGroup className="span-4">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    $hasError={formik.touched.start_at && formik.errors.start_at}
                    {...formik.getFieldProps("start_at")}
                  />
                  {renderError("start_at")}
                </FormGroup>

                <FormGroup className="span-4">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    $hasError={formik.touched.end_at && formik.errors.end_at}
                    {...formik.getFieldProps("end_at")}
                  />
                  {renderError("end_at")}
                </FormGroup>

                <FormGroup className="span-4">
                  <Label>Trainer Assigned</Label>
                  <Select
                    $hasError={
                      formik.touched.trainer_assigned &&
                      formik.errors.trainer_assigned
                    }
                    {...formik.getFieldProps("trainer_assigned")}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </Select>
                  {renderError("trainer_assigned")}
                </FormGroup>
              </FormGrid>
            </ModalBody>

            <ModalFooter>
              <CancelBtn type="button" onClick={handleClose}>
                Cancel
              </CancelBtn>
              <SubmitBtn type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? (
                  <>
                    <Spinner className="spinner-border spinner-border-sm" />
                    Processing...
                  </>
                ) : editData ? (
                  "Update Membership"
                ) : (
                  "Add Membership"
                )}
              </SubmitBtn>
            </ModalFooter>
          </form>
        </ModalContent>
      </ModalWrapper>
    </Overlay>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Styled Components
// ────────────────────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; backdrop-filter: blur(4px); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(13, 11, 30, 0.6);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: ${fadeIn} 0.2s ease forwards;
`;

const ModalWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  animation: ${fadeUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

const ModalContent = styled.div`
  background: var(--white, #ffffff);
  border-radius: var(--r3, 18px);
  box-shadow: var(--shadow-lg, 0 16px 56px rgba(20, 5, 60, 0.13));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: var(--font-ui, "Outfit", sans-serif);
`;

/* ── Header ── */
const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid var(--border, #ede9f5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg, #f7f7fb);
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TitleIcon = styled.i`
  font-size: 1.2rem;
  background: var(--grad, linear-gradient(135deg, #ff6b2b 0%, #ff4a6e 50%, #c026d3 100%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const TitleText = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--th, #0d0b1e);
  letter-spacing: 0.3px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tm, #9490aa);
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: var(--border, #ede9f5);
    color: var(--tb, #35304f);
  }
`;

/* ── Body & Form Layout ── */
const ModalBody = styled.div`
  padding: 24px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border2);
    border-radius: 8px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 18px;

  .span-12 { grid-column: span 12; }
  .span-6 { grid-column: span 6; }
  .span-4 { grid-column: span 4; }
  .span-3 { grid-column: span 3; }

  @media (max-width: 768px) {
    .span-6, .span-4, .span-3 { grid-column: span 12; }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SectionHeader = styled.h4`
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--g3, #c026d3);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin: 8px 0 4px 0;
  display: flex;
  align-items: center;
`;

const Divider = styled.hr`
  border: 0;
  height: 1px;
  background: var(--border, #ede9f5);
  margin: 10px 0;
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

/* ── Inputs ── */
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

  &:disabled, &[readonly] {
    background: var(--bg);
    color: var(--tm);
    cursor: not-allowed;
    border-color: var(--border);
  }
`;

const Input = styled.input`
  ${inputStyles}
  border: 1px solid ${({ $hasError }) =>
    $hasError ? "#fc8181" : "var(--border2, #ddd8ee)"};
  
  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
    transition: 0.2s;
  }
  &::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }
`;

const Select = styled.select`
  ${inputStyles}
  border: 1px solid ${({ $hasError }) =>
    $hasError ? "#fc8181" : "var(--border2, #ddd8ee)"};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239490aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
`;

/* ── Custom Package Dropdown ── */
const CustomSelectTrigger = styled.div`
  ${inputStyles}
  border: 1px solid ${({ $hasError }) =>
    $hasError ? "#fc8181" : "var(--border2, #ddd8ee)"};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: #ffffff;
`;

const SelectedPackageCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg);
  border: 1px solid var(--g1, #ff6b2b);
  border-radius: var(--r1, 8px);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(255, 107, 43, 0.1);
  }
`;

const PkgInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const PkgTitle = styled.span`
  font-weight: 700;
  color: var(--g1);
  font-size: 0.95rem;
`;

const PkgDesc = styled.span`
  font-size: 0.75rem;
  color: var(--tm);
`;

const PkgAction = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  i {
    color: var(--g1);
    font-size: 1.1rem;
  }
`;

const Badge = styled.span`
  background: #38a169;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
`;

const DropdownOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1040;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--white);
  border: 1px solid var(--g1);
  border-radius: var(--r2, 12px);
  box-shadow: var(--shadow-lg);
  z-index: 1050;
  overflow: hidden;
  animation: ${fadeUp} 0.2s ease;
`;

const DropdownSearch = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);

  i.bi-search {
    color: var(--tm);
    margin-right: 10px;
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-family: var(--font-ui);
    font-size: 0.9rem;
    color: var(--th);
  }
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  color: var(--tm);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  i { margin: 0; font-size: 1.2rem; }
  &:hover { color: var(--th); }
`;

const DropdownList = styled.div`
  max-height: 280px;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  th {
    position: sticky;
    top: 0;
    background: var(--bg);
    color: var(--tm);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 10px 14px;
    text-align: left;
    border-bottom: 1px solid var(--border);
    z-index: 1;
  }

  td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    color: var(--tb);
    vertical-align: middle;
  }

  tr {
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: var(--grad-hover, rgba(255,107,43,0.05));
    }
    
    &.selected {
      background: rgba(255,107,43,0.08);
      td { color: var(--g1); }
    }
  }
`;

/* ── Footer & Buttons ── */
const ModalFooter = styled.div`
  padding: 18px 24px;
  background: var(--bg, #f7f7fb);
  border-top: 1px solid var(--border, #ede9f5);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
`;

const CancelBtn = styled.button`
  background: transparent;
  border: none;
  color: var(--tm, #9490aa);
  font-family: var(--font-ui, "Outfit", sans-serif);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 10px 20px;
  border-radius: var(--r1, 8px);
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    color: var(--tb, #35304f);
    background: var(--border, #ede9f5);
  }
`;

const SubmitBtn = styled.button`
  background: var(--grad, linear-gradient(135deg, #ff6b2b 0%, #ff4a6e 50%, #c026d3 100%));
  color: #ffffff;
  border: none;
  font-family: var(--font-ui, "Outfit", sans-serif);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 10px 24px;
  border-radius: var(--r1, 8px);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(255, 74, 110, 0.25);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(255, 74, 110, 0.35);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
`;