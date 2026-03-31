import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled, { keyframes } from "styled-components";
import { rootContext } from "../../App";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";

export default function PackageModal({
  show,
  handleClose,
  onSuccess,
  editData,
}) {
  const rootCtx = useContext(rootContext);
  const [services, setServices] = useState([]);

  const weekOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // ================= VALIDATION =================
  const packageSchema = Yup.object({
    service_id: Yup.number().required("Required"),
    title: Yup.string().required("Required"),
    no_of_sessions: Yup.number().required("Required"),
    duration_in_days: Yup.number().required("Required"),
    mrp_price: Yup.number().required("Required"),
    discount_price: Yup.number().required("Required"),
    gst_percentage: Yup.number().required("Required"),
    appointment_slot_minutes: Yup.number().required("Required"),

    appointment_start: Yup.string().required("Required"),

    appointment_end: Yup.string()
      .required("Required")
      .test(
        "is-greater",
        "End time must be greater than Start time",
        function (value) {
          const { appointment_start } = this.parent;
          if (!appointment_start || !value) return true;
          return value > appointment_start;
        }
      ),

    blocked_start: Yup.string().required("Required"),

    blocked_end: Yup.string()
      .required("Required")
      .test(
        "blocked-greater",
        "Blocked End must be greater than Blocked Start",
        function (value) {
          const { blocked_start } = this.parent;
          if (!blocked_start || !value) return true;
          return value > blocked_start;
        }
      ),

    week_days: Yup.array().min(1, "Select at least one day"),
  });

  // ================= FORMIK =================
  const formik = useFormik({
    initialValues: {
      service_id: editData?.service_id || "",
      title: editData?.title || "",
      no_of_sessions: editData?.sessions || "",
      duration_in_days: editData?.duration_in_days || "",
      short_description: editData?.short_description || "",
      mrp_price: editData?.mrp_price || "",
      discount_price: editData?.price || "",
      selling_price: editData?.price || "",
      gst_percentage: editData?.gst_percentage || "0",
      image: null,
      package_includes: editData?.package_includes || "",
      appointment_slot_minutes: editData?.appointment_slot_minutes || "",
      appointment_start: editData?.appointment_start || "",
      appointment_end: editData?.appointment_end || "",
      blocked_start: editData?.blocked_start || "",
      blocked_end: editData?.blocked_end || "",
      week_days: editData?.week_days
        ? typeof editData.week_days === "string"
          ? JSON.parse(editData.week_days)
          : editData.week_days
        : [],
    },
    enableReinitialize: true,
    validationSchema: packageSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        rootCtx[0](true);

        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (key === "week_days") {
            formData.append(key, JSON.stringify(values[key]));
          } else {
            formData.append(key, values[key]);
          }
        });

        let response;

        if (editData) {
          response = await apiRequest.put(`/package/${editData.id}`, formData, true);
        } else {
          response = await apiRequest.post(`/package/`, formData, true);
        }

        if (response?.status?.toLowerCase() === "success") {
          alert.success("Package Saved Successfully", "Octane GYM");
          resetForm();
          handleClose();
          onSuccess();
        } else {
          alert.error(response?.result || "Something went wrong");
        }
      } catch (error) {
        alert.error(error?.response?.data?.result || "Something went wrong");
      } finally {
        rootCtx[0](false);
        setSubmitting(false);
      }
    },
  });

  // ================= FETCH ACTIVE SERVICES =================
  useEffect(() => {
    const fetchServices = async () => {
      const res = await apiRequest.get("service/get-service");
      if (res?.status?.toUpperCase() === "SUCCESS") {
        const active = res.result.filter((s) => s.status === "active");
        setServices(active);
      }
    };
    fetchServices();
  }, []);

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
                  editData ? "bi bi-box-seam-fill" : "bi bi-box-seam"
                }
              />
              <TitleText>
                {editData ? "Edit Package Details" : "Create New Package"}
              </TitleText>
            </HeaderTitle>
            <CloseButton type="button" onClick={handleClose}>
              <i className="bi bi-x-lg" />
            </CloseButton>
          </ModalHeader>

          <FormContainer onSubmit={formik.handleSubmit}>
            <ModalBody>
              {/* PRIMARY DETAILS SECTION */}
              <SectionTitle>General Information</SectionTitle>
              <FormGrid>
                {/* SERVICE */}
                <FormGroup className="span-3">
                  <Label>Service</Label>
                  <Select
                    $hasError={formik.touched.service_id && formik.errors.service_id}
                    {...formik.getFieldProps("service_id")}
                  >
                    <option value="">Select Service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.title}
                      </option>
                    ))}
                  </Select>
                  {renderError("service_id")}
                </FormGroup>

                {/* TITLE */}
                <FormGroup className="span-3">
                  <Label>Package Title</Label>
                  <Input
                    type="text"
                    placeholder="E.g., 3 Months Pro"
                    $hasError={formik.touched.title && formik.errors.title}
                    {...formik.getFieldProps("title")}
                  />
                  {renderError("title")}
                </FormGroup>

                {/* DURATION */}
                <FormGroup className="span-3">
                  <Label>Duration (Days)</Label>
                  <Input
                    type="number"
                    placeholder="90"
                    $hasError={
                      formik.touched.duration_in_days &&
                      formik.errors.duration_in_days
                    }
                    {...formik.getFieldProps("duration_in_days")}
                  />
                  {renderError("duration_in_days")}
                </FormGroup>

                {/* SESSIONS */}
                <FormGroup className="span-3">
                  <Label>No. of Sessions</Label>
                  <Input
                    type="number"
                    placeholder="0 for unlimited"
                    $hasError={
                      formik.touched.no_of_sessions &&
                      formik.errors.no_of_sessions
                    }
                    {...formik.getFieldProps("no_of_sessions")}
                  />
                  {renderError("no_of_sessions")}
                </FormGroup>

                {/* SHORT DESCRIPTION */}
                <FormGroup className="span-12">
                  <Label>Short Description</Label>
                  <Textarea
                    rows="2"
                    placeholder="Briefly describe the package benefits..."
                    {...formik.getFieldProps("short_description")}
                  />
                </FormGroup>
              </FormGrid>

              <Divider />

              {/* PRICING SECTION */}
              <SectionTitle>Pricing & Media</SectionTitle>
              <FormGrid>
                {/* MRP */}
                <FormGroup className="span-3">
                  <Label>MRP (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    $hasError={formik.touched.mrp_price && formik.errors.mrp_price}
                    {...formik.getFieldProps("mrp_price")}
                  />
                  {renderError("mrp_price")}
                </FormGroup>

                {/* DISCOUNT */}
                <FormGroup className="span-3">
                  <Label>Discount Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    $hasError={
                      formik.touched.discount_price && formik.errors.discount_price
                    }
                    {...formik.getFieldProps("discount_price")}
                  />
                  {renderError("discount_price")}
                </FormGroup>

                {/* SELLING */}
                <FormGroup className="span-3">
                  <Label>Selling Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    $hasError={
                      formik.touched.selling_price && formik.errors.selling_price
                    }
                    {...formik.getFieldProps("selling_price")}
                  />
                  {renderError("selling_price")}
                </FormGroup>

                {/* GST */}
                <FormGroup className="span-3">
                  <Label>GST %</Label>
                  <Input
                    type="number"
                    placeholder="18"
                    $hasError={
                      formik.touched.gst_percentage && formik.errors.gst_percentage
                    }
                    {...formik.getFieldProps("gst_percentage")}
                  />
                  {renderError("gst_percentage")}
                </FormGroup>

                {/* IMAGE UPLOAD */}
                <FormGroup className="span-12">
                  <Label>Package Banner / Image</Label>
                  <FileInput
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      formik.setFieldValue("image", e.currentTarget.files[0])
                    }
                  />
                </FormGroup>

                {/* INCLUDES */}
                <FormGroup className="span-12">
                  <Label>Package Includes (Detailed)</Label>
                  <Textarea
                    rows="3"
                    placeholder="E.g., - Diet Plan&#10;- Personal Trainer&#10;- Supplement Guide"
                    {...formik.getFieldProps("package_includes")}
                  />
                </FormGroup>
              </FormGrid>

              <Divider />

              {/* APPOINTMENT SETTINGS SECTION */}
              <SectionTitle>
                <i className="bi bi-clock-history me-2" />
                Appointment Settings
              </SectionTitle>
              <FormGrid>
                {/* SLOT MINUTES */}
                <FormGroup className="span-4">
                  <Label>Slot Minutes</Label>
                  <Input
                    type="number"
                    placeholder="30"
                    $hasError={
                      formik.touched.appointment_slot_minutes &&
                      formik.errors.appointment_slot_minutes
                    }
                    {...formik.getFieldProps("appointment_slot_minutes")}
                  />
                  {renderError("appointment_slot_minutes")}
                </FormGroup>

                {/* APPOINTMENT START */}
                <FormGroup className="span-4">
                  <Label>Appointment Start</Label>
                  <Input
                    type="time"
                    $hasError={
                      formik.touched.appointment_start &&
                      formik.errors.appointment_start
                    }
                    {...formik.getFieldProps("appointment_start")}
                  />
                  {renderError("appointment_start")}
                </FormGroup>

                {/* APPOINTMENT END */}
                <FormGroup className="span-4">
                  <Label>Appointment End</Label>
                  <Input
                    type="time"
                    value={formik.values.appointment_end}
                    min={formik.values.appointment_start || ""}
                    disabled={!formik.values.appointment_start}
                    $hasError={
                      formik.touched.appointment_end &&
                      formik.errors.appointment_end
                    }
                    onChange={(e) => {
                      const selectedTime = e.target.value;
                      const startTime = formik.values.appointment_start;

                      if (!startTime || selectedTime >= startTime) {
                        formik.setFieldValue("appointment_end", selectedTime);
                      }
                    }}
                  />
                  {renderError("appointment_end")}
                </FormGroup>

                {/* BLOCKED START */}
                <FormGroup className="span-6">
                  <Label>Blocked Start Time</Label>
                  <Input
                    type="time"
                    $hasError={
                      formik.touched.blocked_start && formik.errors.blocked_start
                    }
                    {...formik.getFieldProps("blocked_start")}
                  />
                  {renderError("blocked_start")}
                </FormGroup>

                {/* BLOCKED END */}
                <FormGroup className="span-6">
                  <Label>Blocked End Time</Label>
                  <Input
                    type="time"
                    value={formik.values.blocked_end}
                    min={formik.values.blocked_start || ""}
                    disabled={!formik.values.blocked_start}
                    $hasError={
                      formik.touched.blocked_end && formik.errors.blocked_end
                    }
                    onChange={(e) => {
                      const selectedTime = e.target.value;
                      const startTime = formik.values.blocked_start;

                      if (!startTime || selectedTime >= startTime) {
                        formik.setFieldValue("blocked_end", selectedTime);
                      }
                    }}
                  />
                  {renderError("blocked_end")}
                </FormGroup>

                {/* WEEK DAYS */}
                <FormGroup className="span-12 mt-2">
                  <Label>Applicable Week Days</Label>
                  <PillContainer>
                    {weekOptions.map((day) => {
                      const isSelected = formik.values.week_days.includes(day);
                      return (
                        <DayPill
                          type="button"
                          key={day}
                          $active={isSelected}
                          onClick={() => {
                            if (isSelected) {
                              formik.setFieldValue(
                                "week_days",
                                formik.values.week_days.filter((d) => d !== day)
                              );
                            } else {
                              formik.setFieldValue("week_days", [
                                ...formik.values.week_days,
                                day,
                              ]);
                            }
                          }}
                        >
                          {day}
                          {isSelected && <i className="bi bi-check" />}
                        </DayPill>
                      );
                    })}
                  </PillContainer>
                  {renderError("week_days")}
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
                    Saving...
                  </>
                ) : editData ? (
                  "Update Package"
                ) : (
                  "Create Package"
                )}
              </SubmitBtn>
            </ModalFooter>
          </FormContainer>
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
  max-height: 95vh;
  display: flex;
  flex-direction: column;
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
  max-height: 100%;
`;

/* ── Header ── */
const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid var(--border, #ede9f5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg, #f7f7fb);
  flex-shrink: 0;
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
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border2);
    border-radius: 8px;
  }
`;

const SectionTitle = styled.h4`
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--g3, #c026d3);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
`;

const Divider = styled.hr`
  border: 0;
  height: 1px;
  background: var(--border, #ede9f5);
  margin: 28px 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 18px;

  .span-12 { grid-column: span 12; }
  .span-6 { grid-column: span 6; }
  .span-4 { grid-column: span 4; }
  .span-3 { grid-column: span 3; }

  @media (max-width: 992px) {
    .span-3, .span-4 { grid-column: span 6; }
  }
  @media (max-width: 576px) {
    .span-3, .span-4, .span-6 { grid-column: span 12; }
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
  
  &:disabled {
    background: var(--bg);
    cursor: not-allowed;
    opacity: 0.7;
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

const Textarea = styled.textarea`
  ${inputStyles}
  border: 1px solid var(--border2, #ddd8ee);
  resize: vertical;
  min-height: 80px;
`;

const FileInput = styled.input`
  ${inputStyles}
  border: 1px dashed var(--border2, #ddd8ee);
  padding: 8px 10px;
  background: var(--bg);
  cursor: pointer;

  &::file-selector-button {
    background: var(--white);
    border: 1px solid var(--border2);
    border-radius: 6px;
    padding: 4px 12px;
    margin-right: 12px;
    font-family: var(--font-ui);
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--tb);
    cursor: pointer;
    transition: 0.2s;
  }

  &::file-selector-button:hover {
    border-color: var(--g2);
    color: var(--g2);
  }
`;

/* ── Custom Pills ── */
const PillContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const DayPill = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-ui, "Outfit", sans-serif);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 40px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  background: ${({ $active }) => ($active ? "var(--grad)" : "var(--white)")};
  color: ${({ $active }) => ($active ? "#ffffff" : "var(--tm)")};
  border: 1px solid ${({ $active }) => ($active ? "transparent" : "var(--border2)")};
  box-shadow: ${({ $active }) => ($active ? "0 4px 12px rgba(255, 74, 110, 0.25)" : "none")};

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $active }) => ($active ? "transparent" : "var(--tm)")};
  }
  
  i {
    font-size: 1.1rem;
    margin-right: -4px;
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
  flex-shrink: 0;
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