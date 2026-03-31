import React, { useContext, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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

        if (res.status?.toUpperCase() === "SUCCESS" || res.status === "success" || res.status === "ok") {
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

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                {editData ? "Edit Inquiry" : "Add New Inquiry"}
              </h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            <div className="modal-body">
              <div className="row">

                <div className="col-md-6 mb-3">
                  <label className="fw-semibold">Prospect Name</label>
                  <input
                    className={`form-control ${formik.touched.name && formik.errors.name ? "is-invalid" : ""}`}
                    {...formik.getFieldProps("name")}
                  />
                  <div className="invalid-feedback">{formik.errors.name}</div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="fw-semibold">Mobile Number</label>
                  <input
                    className={`form-control ${formik.touched.mobile && formik.errors.mobile ? "is-invalid" : ""}`}
                    {...formik.getFieldProps("mobile")}
                  />
                  <div className="invalid-feedback">{formik.errors.mobile}</div>
                </div>

                <div className="col-md-12 mb-3">
                  <label className="fw-semibold">Email Address</label>
                  <input
                    className={`form-control ${formik.touched.email && formik.errors.email ? "is-invalid" : ""}`}
                    {...formik.getFieldProps("email")}
                  />
                  <div className="invalid-feedback">{formik.errors.email}</div>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="fw-semibold">Source</label>
                  <select className="form-select" {...formik.getFieldProps("source")}>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google">Google</option>
                    <option value="Reference">Reference</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="fw-semibold">Lead Type</label>
                  <select className="form-select" {...formik.getFieldProps("convert")}>
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>

                {editData && (
                  <div className="col-md-4 mb-3">
                    <label className="fw-semibold">Status</label>
                    <select className="form-select" {...formik.getFieldProps("status")}>
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                )}

                <div className="col-md-12 mb-3">
                  <label className="fw-semibold">Discussion Notes</label>
                  <textarea
                    rows="3"
                    className={`form-control ${formik.touched.Notes && formik.errors.Notes ? "is-invalid" : ""}`}
                    placeholder="Enter discussion details..."
                    {...formik.getFieldProps("Notes")}
                  ></textarea>
                  <div className="invalid-feedback">{formik.errors.Notes}</div>
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={formik.isSubmitting}
                onClick={formik.handleSubmit}
              >
                {formik.isSubmitting
                  ? "Processing..."
                  : editData
                  ? "Update Inquiry"
                  : "Save Inquiry"}
              </button>
            </div>

          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}