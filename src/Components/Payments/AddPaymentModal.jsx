import { useFormik } from "formik";
import * as Yup from "yup";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";
import { useState } from "react";

export default function AddPaymentModal({
  show,
  handleClose,
  invoiceId,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      invoiceId: invoiceId,
      payment_date: new Date().toISOString().substring(0, 10),
      amount: "",
      payment_mode: "cash",
      remark: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      amount: Yup.number().required("Required"),
      payment_mode: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);

        const res = await apiRequest.post("/payment", values);

        if (res.status === "success") {
          alert.success("Payment Added Successfully");
          onSuccess();
          handleClose();
        } else {
          alert.error(res.result);
        }
      } catch (err) {
        alert.error("Payment Failed");
      } finally {
        setLoading(false);
      }
    },
  });

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Add Payment</h5>
              <button className="btn-close" onClick={handleClose}></button>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <div className="modal-body">

                <div className="mb-3">
                  <label>Date</label>
                  <input
                    type="date"
                    className="form-control"
                    {...formik.getFieldProps("payment_date")}
                  />
                </div>

                <div className="mb-3">
                  <label>Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    {...formik.getFieldProps("amount")}
                  />
                </div>

                <div className="mb-3">
                  <label>Payment Mode</label>
                  <select
                    className="form-select"
                    {...formik.getFieldProps("payment_mode")}
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label>Remark</label>
                  <input
                    className="form-control"
                    {...formik.getFieldProps("remark")}
                  />
                </div>

              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleClose}>
                  Cancel
                </button>
                <button className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}