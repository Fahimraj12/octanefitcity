import React, { useContext, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled, { keyframes } from "styled-components";
import { rootContext } from "../../App";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";

export default function MembershipPackageModal({
  show,
  handleClose,
  onSuccess,
  editData,
}) {
  const rootCtx = useContext(rootContext);

  const packageSchema = Yup.object({
    name: Yup.string().required("Required"),
    membership_type: Yup.string().required("Required"),
    duration: Yup.string().required("Required"),
    mrp: Yup.number().required("Required"),
    discount: Yup.number().required("Required"),
    selling_price: Yup.number().required("Required"),
    status: Yup.string().required("Required"),
    // ✅ Naye Fields Validation
    gst_status: Yup.string().required("Required"),
    gst_percentage: Yup.number().when("gst_status", {
      is: "included",
      then: (schema) => schema.required("GST % is required when included").min(0),
      otherwise: (schema) => schema.nullable(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      membership_type: "",
      duration: "",
      mrp: "",
      discount: "",
      selling_price: "",
      status: "active",
      gst_status: "excluded", // ✅ Default 'excluded'
      gst_percentage: "",
    },
    validationSchema: packageSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        rootCtx[0](true);

        let response;

        if (editData) {
          response = await apiRequest.put(
            `membershippackage/update-membershippackages/${editData.id}`,
            values
          );
        } else {
          response = await apiRequest.post(
            "membershippackage/add-membershippackage",
            values
          );
        }

        if (response.status === "success") {
          alert.success(
            editData
              ? "Package Updated Successfully"
              : "Package Added Successfully"
          );

          resetForm();
          handleClose();
          onSuccess();
        } else {
          alert.error(response.result);
        }
      } catch (error) {
        alert.error("Something went wrong");
      } finally {
        rootCtx[0](false);
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (editData) {
      formik.setValues({
        name: editData.name || "",
        membership_type: editData.membership_type || "",
        duration: editData.duration || "",
        mrp: editData.mrp || "",
        discount: editData.discount || "",
        selling_price: editData.selling_price || "",
        status: editData.status || "active",
        // ✅ Edit mode mein data bind karein
        gst_status: editData.gst_status || "excluded",
        gst_percentage: editData.gst_percentage || "",
      });
    }
  }, [editData]);

  useEffect(() => {
    const mrp = Number(formik.values.mrp);
    const discount = Number(formik.values.discount);
    const gstStatus = formik.values.gst_status;
    const gstPercentage = Number(formik.values.gst_percentage);

    if (!isNaN(mrp) && !isNaN(discount)) {
      // Base price calculate karein
      let basePrice = mrp - (mrp * discount) / 100;

      // Agar GST Include hai, toh selling price mein GST add karein
      if (
        gstStatus === "included" &&
        !isNaN(gstPercentage) &&
        gstPercentage > 0
      ) {
        const gstAmount = (basePrice * gstPercentage) / 100;
        basePrice = basePrice + gstAmount;
      }

      formik.setFieldValue(
        "selling_price",
        basePrice > 0 ? basePrice.toFixed(2) : 0
      );
    }
  }, [
    formik.values.mrp,
    formik.values.discount,
    formik.values.gst_status,
    formik.values.gst_percentage,
  ]);

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
                  editData ? "bi bi-credit-card-fill" : "bi bi-credit-card"
                }
              />
              <TitleText>
                {editData ? "Edit Membership Package" : "Add Membership Package"}
              </TitleText>
            </HeaderTitle>
            <CloseButton type="button" onClick={handleClose}>
              <i className="bi bi-x-lg" />
            </CloseButton>
          </ModalHeader>

          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <FormGrid>
                {/* GENERAL DETAILS */}
                <SectionHeader className="span-12">
                  <i className="bi bi-info-circle me-2" />
                  General Details
                </SectionHeader>

                <FormGroup className="span-6">
                  <Label>Package Name</Label>
                  <Input
                    type="text"
                    placeholder="E.g., Elite Yearly"
                    $hasError={formik.touched.name && formik.errors.name}
                    {...formik.getFieldProps("name")}
                  />
                  {renderError("name")}
                </FormGroup>

                <FormGroup className="span-6">
                  <Label>Membership Type</Label>
                  <Input
                    type="text"
                    placeholder="E.g., Couple, Individual"
                    $hasError={
                      formik.touched.membership_type &&
                      formik.errors.membership_type
                    }
                    {...formik.getFieldProps("membership_type")}
                  />
                  {renderError("membership_type")}
                </FormGroup>

                <FormGroup className="span-6">
                  <Label>Duration</Label>
                  <Input
                    type="text"
                    placeholder="E.g., 1 Year, 6 Months"
                    $hasError={formik.touched.duration && formik.errors.duration}
                    {...formik.getFieldProps("duration")}
                  />
                  {renderError("duration")}
                </FormGroup>

                <FormGroup className="span-6">
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

                <Divider className="span-12" />

                {/* PRICING DETAILS */}
                <SectionHeader className="span-12">
                  <i className="bi bi-tag me-2" />
                  Pricing & GST
                </SectionHeader>

                <FormGroup className="span-4">
                  <Label>MRP (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    $hasError={formik.touched.mrp && formik.errors.mrp}
                    {...formik.getFieldProps("mrp")}
                  />
                  {renderError("mrp")}
                </FormGroup>

                <FormGroup className="span-4">
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    $hasError={formik.touched.discount && formik.errors.discount}
                    {...formik.getFieldProps("discount")}
                  />
                  {renderError("discount")}
                </FormGroup>

                <FormGroup className="span-4">
                  <Label>Final Selling Price</Label>
                  <ReadOnlyInput>
                    <span className="currency">₹</span>
                    <input
                      type="number"
                      value={formik.values.selling_price}
                      readOnly
                    />
                  </ReadOnlyInput>
                  {renderError("selling_price")}
                </FormGroup>

                <FormGroup className="span-6 mt-2">
                  <Label>GST Status</Label>
                  <Select
                    $hasError={
                      formik.touched.gst_status && formik.errors.gst_status
                    }
                    {...formik.getFieldProps("gst_status")}
                  >
                    <option value="excluded">Excluded (No GST)</option>
                    <option value="included">Included (Add GST to Base)</option>
                  </Select>
                  {renderError("gst_status")}
                </FormGroup>

                {formik.values.gst_status === "included" && (
                  <FormGroup className="span-6 mt-2">
                    <Label>GST %</Label>
                    <InputGroup
                      $hasError={
                        formik.touched.gst_percentage &&
                        formik.errors.gst_percentage
                      }
                    >
                      <GroupInput
                        type="number"
                        placeholder="e.g. 18"
                        {...formik.getFieldProps("gst_percentage")}
                      />
                      <Suffix>%</Suffix>
                    </InputGroup>
                    {renderError("gst_percentage")}
                  </FormGroup>
                )}
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
                  "Update Package"
                ) : (
                  "Add Package"
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
  max-width: 760px;
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
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 18px;

  .span-12 { grid-column: span 12; }
  .span-6 { grid-column: span 6; }
  .span-4 { grid-column: span 4; }

  @media (max-width: 768px) {
    .span-6, .span-4 { grid-column: span 12; }
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
`;

const Input = styled.input`
  ${inputStyles}
  border: 1px solid ${({ $hasError }) =>
    $hasError ? "#fc8181" : "var(--border2, #ddd8ee)"};
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

const ReadOnlyInput = styled.div`
  display: flex;
  align-items: stretch;
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: var(--r1, 8px);
  overflow: hidden;

  .currency {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 14px;
    font-weight: 700;
    color: var(--tb);
    border-right: 1px solid var(--border2);
    background: var(--border, #ede9f5);
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 10px 14px;
    font-family: var(--font-ui);
    font-size: 1rem;
    font-weight: 800;
    color: var(--g1, #ff6b2b); /* highlight the final price */
    outline: none;
    pointer-events: none;
  }
`;

const InputGroup = styled.div`
  display: flex;
  align-items: stretch;
  border: 1px solid ${({ $hasError }) =>
    $hasError ? "#fc8181" : "var(--border2, #ddd8ee)"};
  border-radius: var(--r1, 8px);
  overflow: hidden;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: var(--g2, #ff4a6e);
    box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1);
  }
`;

const GroupInput = styled.input`
  ${inputStyles}
  border: none !important;
  border-radius: 0;
  box-shadow: none !important;
  flex: 1;
`;

const Suffix = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: var(--bg, #f7f7fb);
  color: var(--tb, #35304f);
  font-weight: 700;
  font-size: 0.95rem;
  border-left: 1px solid var(--border2, #ddd8ee);
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