import React, { useContext, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled, { keyframes } from "styled-components";
import { rootContext } from "../../App";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";

export default function ServiceModal({
  show,
  handleClose,
  onSuccess,
  editData,
}) {
  const rootCtx = useContext(rootContext);

  const serviceSchema = Yup.object({
    title: Yup.string().required("Required"),
    description: Yup.string().required("Required"),
    status: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      status: "active",
    },
    validationSchema: serviceSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        rootCtx[0](true);

        let response;

        if (editData) {
          response = await apiRequest.put(
            `service/update-service/${editData.id}`,
            values
          );
        } else {
          response = await apiRequest.post(`service/add-service`, values);
        }

        const isSuccess =
          response?.service?.status?.toLowerCase() === "success" ||
          response?.status?.toLowerCase() === "success" ||
          response?.message?.toLowerCase().includes("success");

        if (isSuccess) {
          alert.success(
            editData
              ? "Service Updated Successfully"
              : "Service Added Successfully",
            "Octane GYM"
          );

          resetForm();
          handleClose();
          onSuccess();
        } else {
          alert.error(
            response?.service?.result ||
              response?.result ||
              response?.message ||
              "Something went wrong"
          );
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
    if (editData) {
      formik.setValues({
        title: editData.title || "",
        description: editData.description || "",
        status: editData.status || "active",
      });
    }
  }, [editData]);

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
                  editData ? "bi bi-gear-fill" : "bi bi-gear-wide-connected"
                }
              />
              <TitleText>
                {editData ? "Edit Service" : "Add New Service"}
              </TitleText>
            </HeaderTitle>
            <CloseButton type="button" onClick={handleClose}>
              <i className="bi bi-x-lg" />
            </CloseButton>
          </ModalHeader>

          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <FormGrid>
                {/* TITLE */}
                <FormGroup className="span-6">
                  <Label>Service Title</Label>
                  <Input
                    type="text"
                    placeholder="E.g., Personal Training, Yoga Class"
                    $hasError={formik.touched.title && formik.errors.title}
                    {...formik.getFieldProps("title")}
                  />
                  {renderError("title")}
                </FormGroup>

                {/* STATUS */}
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

                {/* DESCRIPTION */}
                <FormGroup className="span-12">
                  <Label>Description</Label>
                  <Textarea
                    rows="4"
                    placeholder="Briefly describe what this service includes..."
                    $hasError={
                      formik.touched.description && formik.errors.description
                    }
                    {...formik.getFieldProps("description")}
                  />
                  {renderError("description")}
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
                  "Update Service"
                ) : (
                  "Create Service"
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
  max-width: 650px;
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
  gap: 20px;

  .span-12 { grid-column: span 12; }
  .span-6 { grid-column: span 6; }

  @media (max-width: 576px) {
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

const Textarea = styled.textarea`
  ${inputStyles}
  border: 1px solid ${({ $hasError }) =>
    $hasError ? "#fc8181" : "var(--border2, #ddd8ee)"};
  resize: vertical;
  min-height: 80px;
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