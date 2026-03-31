import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled, { keyframes } from "styled-components";
import { rootContext } from "../../App";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";

export default function LevelModal({ show, handleClose, onSuccess, editData }) {
  const rootCtx = useContext(rootContext);
  const [preview, setPreview] = useState(null);

  const levelSchema = Yup.object({
    title: Yup.string().required("Required"),
    // If editing, image is optional. If new, it's required.
    image: editData
      ? Yup.mixed().nullable()
      : Yup.mixed().required("Image is required"),
    description: Yup.string().required("Required"),
    status: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      image: null,
      description: "",
      status: "active",
    },
    validationSchema: levelSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        rootCtx[0](true);
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("status", values.status);

        // Only append image if it is a File object (user selected a new one)
        if (values.image && values.image.name) {
          formData.append("image", values.image);
        }

        let response;
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        if (editData) {
          response = await apiRequest.put(
            `level/update-level/${editData.id}`,
            formData,
            config
          );
        } else {
          response = await apiRequest.post(`level/add-level`, formData, config);
        }

        if (response.status?.toUpperCase() === "SUCCESS") {
          alert.success(editData ? "Level Updated" : "Level Added", "Octane GYM");
          resetForm();
          handleClose();
          onSuccess();
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Something went wrong";
        alert.error(errorMsg);
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
        image: null,
        description: editData.description || "",
        status: editData.status || "active",
      });
      setPreview(editData.image);
    } else {
      setPreview(null);
    }
  }, [editData, show]);

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
              <TitleIcon className="bi bi-bar-chart-steps" />
              <TitleText>
                {editData ? "Edit Fitness Level" : "Add Fitness Level"}
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
                  <Label>Level Title</Label>
                  <Input
                    type="text"
                    placeholder="E.g., Beginner, Advanced"
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

                {/* IMAGE UPLOAD & PREVIEW */}
                <FormGroup className="span-12">
                  <Label>Cover Image</Label>
                  <ImageControlArea>
                    <FileInput
                      type="file"
                      accept="image/*"
                      $hasError={formik.touched.image && formik.errors.image}
                      onChange={(e) => {
                        const file = e.currentTarget.files[0];
                        formik.setFieldValue("image", file);
                        if (file) {
                          setPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    {preview && (
                      <PreviewBox>
                        <img src={preview} alt="Level Preview" />
                      </PreviewBox>
                    )}
                  </ImageControlArea>
                  {renderError("image")}
                </FormGroup>

                {/* DESCRIPTION */}
                <FormGroup className="span-12">
                  <Label>Level Description</Label>
                  <Textarea
                    rows="4"
                    placeholder="Define the scope and requirements of this level..."
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
                  "Update Level"
                ) : (
                  "Add Level"
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
  .span-12 { grid-column: span 12; } .span-6 { grid-column: span 6; }
  @media (max-width: 768px) { .span-6 { grid-column: span 12; } }
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

const ImageControlArea = styled.div`
  display: flex; gap: 16px; align-items: center;
  @media (max-width: 576px) { flex-direction: column; align-items: stretch; }
`;

const FileInput = styled.input`
  ${inputStyles} flex: 1; padding: 7px 10px; background: var(--bg); border: 1px dashed ${props => props.$hasError ? "#fc8181" : "var(--border2)"};
  &::file-selector-button {
    background: #fff; border: 1px solid var(--border2); border-radius: 4px; padding: 2px 10px;
    font-size: 0.75rem; font-weight: 600; cursor: pointer; margin-right: 10px;
  }
`;

const PreviewBox = styled.div`
  width: 80px; height: 80px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border2); flex-shrink: 0;
  img { width: 100%; height: 100%; object-fit: cover; }
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