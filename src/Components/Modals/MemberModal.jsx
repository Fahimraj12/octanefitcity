import React, { useContext, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled, { keyframes } from "styled-components";
import { rootContext } from "../../App";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";

export default function MemberModal({
  show,
  handleClose,
  onSuccess,
  editData,
}) {
  const rootCtx = useContext(rootContext);

  // Refs for resetting file inputs
  const profileImageRef = useRef(null);
  const documentFileRef = useRef(null);

  const memberSchema = Yup.object({
    name: Yup.string().required("Required"),
    email: Yup.string().email("Invalid format").required("Required"),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, "Must be 10 digits")
      .required("Required"),
    dob: Yup.date().required("Required"),
    gender: Yup.string().required("Required"),
    status: Yup.string().required("Required"),
    blood_group: Yup.string().required("Required"),
    student: Yup.string().required("Required"),
    document_type: Yup.string(),
    document_number: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      mobile: "",
      dob: "",
      gender: "male",
      status: "active",
      blood_group: "A+",
      student: "no",
      document_type: "Aadhar",
      document_number: "",
      profile_image: null,
      document_file: null,
    },
    validationSchema: memberSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        rootCtx[0](true);

        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (key !== "profile_image" && key !== "document_file") {
            if (values[key]) {
              formData.append(key, values[key]);
            }
          }
        });

        if (values.profile_image) {
          formData.append("profile_image", values.profile_image);
        }
        if (values.document_file) {
          formData.append("document_file", values.document_file);
        }

        const config = {
          headers: { "Content-Type": "multipart/form-data" },
        };

        let response;
        if (editData) {
          response = await apiRequest.put(
            `member/update-member/${editData.id}`,
            formData,
            config
          );
        } else {
          response = await apiRequest.post(`member/add-member`, formData, config);
        }

        if (response.status?.toUpperCase() === "SUCCESS" || response.data?.success) {
          alert.success(
            editData ? "Member Updated Successfully" : "Member Added Successfully",
            "Octane GYM"
          );

          resetForm();
          if (profileImageRef.current) profileImageRef.current.value = "";
          if (documentFileRef.current) documentFileRef.current.value = "";
          handleClose();

          if (onSuccess) {
            onSuccess(response.data?.data || response.result);
          }
        } else {
          alert.error(response.result || response.data?.message);
        }
      } catch (error) {
        alert.error(
          error?.response?.data?.message ||
            error?.response?.data?.result ||
            "Something went wrong"
        );
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
        dob: editData.dob?.substring(0, 10) || "",
        gender: editData.gender || "male",
        status: editData.status || "active",
        blood_group: editData.blood_group || "A+",
        student: editData.student || "no",
        document_type: editData.document_type || "Aadhar",
        document_number: editData.document_number || "",
        profile_image: null,
        document_file: null,
      });
    }
  }, [editData]);

  if (!show) return null;

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
              <TitleIcon className={editData ? "bi bi-person-gear" : "bi bi-person-plus"} />
              <TitleText>{editData ? "Edit Member Profile" : "Register New Member"}</TitleText>
            </HeaderTitle>
            <CloseButton type="button" onClick={handleClose}>
              <i className="bi bi-x-lg" />
            </CloseButton>
          </ModalHeader>

          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <FormGrid>
                {/* ── PERSONAL DETAILS ── */}
                <SectionHeader className="span-12">
                  <i className="bi bi-person-lines-fill me-2" /> Personal Information
                </SectionHeader>

                <FormGroup className="span-6">
                  <Label>Full Name</Label>
                  <Input
                    $hasError={formik.touched.name && formik.errors.name}
                    {...formik.getFieldProps("name")}
                    placeholder="E.g. Rajesh Kumar"
                  />
                  {renderError("name")}
                </FormGroup>

                <FormGroup className="span-6">
                  <Label>Email Address</Label>
                  <Input
                    $hasError={formik.touched.email && formik.errors.email}
                    {...formik.getFieldProps("email")}
                    placeholder="rajesh@example.com"
                  />
                  {renderError("email")}
                </FormGroup>

                <FormGroup className="span-6">
                  <Label>Mobile Number</Label>
                  <Input
                    $hasError={formik.touched.mobile && formik.errors.mobile}
                    {...formik.getFieldProps("mobile")}
                    placeholder="9876543210"
                  />
                  {renderError("mobile")}
                </FormGroup>

                <FormGroup className="span-6">
                  <Label>Date of Birth</Label>
                  <Input type="date" {...formik.getFieldProps("dob")} />
                  {renderError("dob")}
                </FormGroup>

                <FormGroup className="span-3">
                  <Label>Gender</Label>
                  <Select {...formik.getFieldProps("gender")}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </FormGroup>

                <FormGroup className="span-3">
                  <Label>Blood Group</Label>
                  <Select {...formik.getFieldProps("blood_group")}>
                    <option value="A+">A+</option>
                    <option value="O+">O+</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                  </Select>
                </FormGroup>

                <FormGroup className="span-3">
                  <Label>Is Student?</Label>
                  <Select {...formik.getFieldProps("student")}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </Select>
                </FormGroup>

                <FormGroup className="span-3">
                  <Label>Status</Label>
                  <Select {...formik.getFieldProps("status")}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </FormGroup>

                <Divider className="span-12" />

                {/* ── DOCUMENTS ── */}
                <SectionHeader className="span-12">
                  <i className="bi bi-shield-check me-2" /> Verification & Media
                </SectionHeader>

                <FormGroup className="span-6">
                  <Label>Document Type</Label>
                  <Select {...formik.getFieldProps("document_type")}>
                    <option value="Aadhar">Aadhar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormGroup>

                <FormGroup className="span-6">
                  <Label>Document Number</Label>
                  <Input
                    placeholder="Enter Identification Number"
                    {...formik.getFieldProps("document_number")}
                  />
                </FormGroup>

                <FormGroup className="span-6">
                  <Label>Profile Image (Optional)</Label>
                  <FileInput
                    type="file"
                    accept="image/*"
                    ref={profileImageRef}
                    onChange={(e) => formik.setFieldValue("profile_image", e.currentTarget.files[0])}
                  />
                </FormGroup>

                <FormGroup className="span-6">
                  <Label>Upload Document (Optional)</Label>
                  <FileInput
                    type="file"
                    accept="image/*,.pdf"
                    ref={documentFileRef}
                    onChange={(e) => formik.setFieldValue("document_file", e.currentTarget.files[0])}
                  />
                  <small style={{ fontSize: "0.65rem", color: "var(--tm)", marginTop: "4px" }}>
                    Supports JPG, PNG, or PDF
                  </small>
                </FormGroup>
              </FormGrid>
            </ModalBody>

            <ModalFooter>
              <CancelBtn type="button" onClick={handleClose}>Cancel</CancelBtn>
              <SubmitBtn type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? (
                  <><Spinner className="spinner-border spinner-border-sm" /> Saving...</>
                ) : editData ? "Update Member" : "Add Member"}
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
  width: 100%; max-width: 850px; animation: ${fadeUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

const ModalBody = styled.div`
  padding: 24px; max-height: 75vh; overflow-y: auto;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 10px; }
`;

const SectionHeader = styled.h4`
  font-size: 0.85rem; font-weight: 800; color: var(--g3); text-transform: uppercase;
  letter-spacing: 1.2px; margin: 10px 0 4px 0;
`;

const Divider = styled.hr`border: 0; height: 1px; background: var(--border); margin: 12px 0;`;

const FormGrid = styled.div`
  display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px;
  .span-12 { grid-column: span 12; } .span-6 { grid-column: span 6; } .span-3 { grid-column: span 3; }
  @media (max-width: 768px) { .span-6, .span-3 { grid-column: span 12; } }
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

const FileInput = styled.input`
  ${inputStyles} padding: 7px 10px; background: var(--bg); border: 1px dashed var(--border2);
  &::file-selector-button {
    background: #fff; border: 1px solid var(--border2); border-radius: 4px; padding: 2px 10px;
    font-size: 0.75rem; font-weight: 600; cursor: pointer; margin-right: 10px;
  }
`;

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
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(255, 74, 110, 0.3); }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const Spinner = styled.span`width: 1rem; height: 1rem; border-width: 0.15em;`;