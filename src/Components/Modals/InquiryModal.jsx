import React, { useContext, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled, { keyframes } from "styled-components";
import { rootContext } from "../../App";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";

export default function InquiryModal({ show, handleClose, onSuccess, editData }) {
  const rootCtx = useContext(rootContext);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      mobile: "",
      source: "Walk-in",
      convert: "Warm",
      status: "open",
      Notes: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      mobile: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      Notes: Yup.string().required("Required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        rootCtx[0](true);

        let res;
        if (editData) {
          // PUT /inquiries/:id
          res = await apiRequest.put(`inquiries/${editData.id}`, values);
        } else {
          // POST /inquiries/
          res = await apiRequest.post(`inquiries`, values);
        }

        if (
          res.status?.toUpperCase() === "SUCCESS" ||
          res.status === "success" ||
          res.status === "ok"
        ) {
          alert.success(editData ? "Inquiry Updated" : "Inquiry Added", "Success");
          resetForm();
          handleClose();
          if (onSuccess) onSuccess();
        } else {
          alert.error(res.message || res.result || "Action failed");
        }
      } catch (error) {
        alert.error(error?.response?.data?.message || "Something went wrong");
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
        email: editData.email || "",
        mobile: editData.mobile || "",
        source: editData.source || "Walk-in",
        convert: editData.convert || "Warm",
        status: editData.status || "open",
        Notes: editData.Notes || "",
      });
    }
  }, [editData]);

  if (!show) return null;

  const renderError = (field) =>
    formik.touched[field] && formik.errors[field] ? (
      <ErrorMessage>{formik.errors[field]}</ErrorMessage>
    ) : null;

  // Dynamically span 4 columns if editData (3 dropdowns), or 6 columns if no editData (2 dropdowns)
  const selectSpan = editData ? "span-4" : "span-6";

  return (
    <Overlay>
      <ModalWrapper>
        <ModalContent>
          <ModalHeader>
            <HeaderTitle>
              <TitleIcon className="bi bi-person-lines-fill" />
              <TitleText>
                {editData ? "Edit Inquiry" : "Add New Inquiry"}
              </TitleText>
            </HeaderTitle>
            <CloseButton type="button" onClick={handleClose}>
              <i className="bi bi-x-lg" />
            </CloseButton>
          </ModalHeader>

          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <FormGrid>
                {/* NAME */}
                <FormGroup className="span-6">
                  <Label>Prospect Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter full name"
                    $hasError={formik.touched.name && formik.errors.name}
                    {...formik.getFieldProps("name")}
                  />
                  {renderError("name")}
                </FormGroup>

                {/* MOBILE */}
                <FormGroup className="span-6">
                  <Label>Mobile Number</Label>
                  <Input
                    type="text"
                    placeholder="e.g., +1 234 567 890"
                    $hasError={formik.touched.mobile && formik.errors.mobile}
                    {...formik.getFieldProps("mobile")}
                  />
                  {renderError("mobile")}
                </FormGroup>

                {/* EMAIL */}
                <FormGroup className="span-12">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="prospect@example.com"
                    $hasError={formik.touched.email && formik.errors.email}
                    {...formik.getFieldProps("email")}
                  />
                  {renderError("email")}
                </FormGroup>

                {/* SOURCE */}
                <FormGroup className={selectSpan}>
                  <Label>Source</Label>
                  <Select
                    $hasError={formik.touched.source && formik.errors.source}
                    {...formik.getFieldProps("source")}
                  >
                    <option value="Walk-in">Walk-in</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google">Google</option>
                    <option value="Reference">Reference</option>
                    <option value="Other">Other</option>
                  </Select>
                  {renderError("source")}
                </FormGroup>

                {/* LEAD TYPE (CONVERT) */}
                <FormGroup className={selectSpan}>
                  <Label>Lead Type</Label>
                  <Select
                    $hasError={formik.touched.convert && formik.errors.convert}
                    {...formik.getFieldProps("convert")}
                  >
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                  </Select>
                  {renderError("convert")}
                </FormGroup>

                {/* STATUS (Only visible when editing) */}
                {editData && (
                  <FormGroup className="span-4">
                    <Label>Status</Label>
                    <Select
                      $hasError={formik.touched.status && formik.errors.status}
                      {...formik.getFieldProps("status")}
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="closed">Closed</option>
                    </Select>
                    {renderError("status")}
                  </FormGroup>
                )}

                {/* NOTES */}
                <FormGroup className="span-12">
                  <Label>Discussion Notes</Label>
                  <Textarea
                    rows="3"
                    placeholder="Enter discussion details, requirements, or follow-up notes..."
                    $hasError={formik.touched.Notes && formik.errors.Notes}
                    {...formik.getFieldProps("Notes")}
                  />
                  {renderError("Notes")}
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
                  "Update Inquiry"
                ) : (
                  "Save Inquiry"
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

const fadeUp = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; backdrop-filter: blur(4px); }`;

const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(13, 11, 30, 0.6); z-index: 1050;
  display: flex; align-items: center; justify-content: center; padding: 16px; animation: ${fadeIn} 0.2s ease forwards;
`;

const ModalWrapper = styled.div`
  width: 100%; max-width: 700px; animation: ${fadeUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

const ModalContent = styled.div`
  background: var(--white, #fff); border-radius: var(--r3, 18px); overflow: hidden;
  box-shadow: var(--shadow-lg); display: flex; flex-direction: column; font-family: var(--font-ui);
`;

const ModalHeader = styled.div`
  padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex;
  justify-content: space-between; align-items: center; background: var(--bg);
`;

const HeaderTitle = styled.div`display: flex; align-items: center; gap: 12px;`;
const TitleIcon = styled.i`
  font-size: 1.2rem; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
`;
const TitleText = styled.h2`margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--th);`;

const CloseButton = styled.button`
  background: none; border: none; width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; color: var(--tm); cursor: pointer;
  &:hover { background: var(--border); color: var(--tb); }
`;

const ModalBody = styled.div`padding: 24px;`;

const FormGrid = styled.div`
  display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px;
  .span-12 { grid-column: span 12; } 
  .span-6 { grid-column: span 6; }
  .span-4 { grid-column: span 4; }
  @media (max-width: 768px) { 
    .span-6, .span-4 { grid-column: span 12; } 
  }
`;

const FormGroup = styled.div`display: flex; flex-direction: column; gap: 6px;`;
const Label = styled.label`font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--tb);`;

const inputStyles = `
  width: 100%; font-family: var(--font-ui); font-size: 0.9rem; font-weight: 500; color: var(--th);
  background: #fff; border-radius: var(--r1, 8px); padding: 10px 14px; outline: none; transition: 0.2s;
  border: 1px solid var(--border2); &:focus { border-color: var(--g2); box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1); }
`;

const Input = styled.input`${inputStyles} border-color: ${props => props.$hasError ? "#fc8181" : "var(--border2)"};`;

const Select = styled.select`${inputStyles} cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239490aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat; background-position: right 14px center; background-size: 14px;
`;

const Textarea = styled.textarea`${inputStyles} resize: vertical; min-height: 80px; border-color: ${props => props.$hasError ? "#fc8181" : "var(--border2)"};`;

const ErrorMessage = styled.span`font-size: 0.7rem; color: #e53e3e; font-weight: 600; margin-top: 2px;`;

const ModalFooter = styled.div`
  padding: 18px 24px; background: var(--bg); border-top: 1px solid var(--border);
  display: flex; justify-content: flex-end; gap: 12px;
`;

const CancelBtn = styled.button`
  background: none; border: none; color: var(--tm); font-weight: 600; padding: 10px 20px; cursor: pointer;
  &:hover { color: var(--tb); background: var(--border); border-radius: var(--r1); }
`;

const SubmitBtn = styled.button`
  background: var(--grad); color: #fff; border: none; font-weight: 700; padding: 10px 24px;
  border-radius: var(--r1); cursor: pointer; box-shadow: 0 4px 12px rgba(255, 74, 110, 0.2);
  display: flex; align-items: center; gap: 8px;
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(255, 74, 110, 0.3); }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const Spinner = styled.span`width: 1rem; height: 1rem; border-width: 0.15em;`;