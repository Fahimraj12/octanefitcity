import React from "react";
import { useFormik } from "formik";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";

export default function PaymentModal({ data, onClose, onSuccess }) {
    const formik = useFormik({
        initialValues: {
            payment_status: "paid",
            payment_method: "cash"
        },
        onSubmit: async (values) => {
            try {
                // Adjust endpoint to your API structure
                const res = await apiRequest.put(`appointment/update-payment/${data.id}`, values);
                if (res.status?.toUpperCase() === "SUCCESS") {
                    alert.success("Payment status updated successfully");
                    onSuccess();
                    onClose();
                }
            } catch (err) {
                alert.error("Something went wrong");
            }
        }
    });

    return (
        <>
            <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header bg-warning text-dark">
                            <h5 className="modal-title fw-bold">Update Payment Status</h5>
                            <button className="btn-close" onClick={onClose}></button>
                        </div>
                        <form onSubmit={formik.handleSubmit}>
                            <div className="modal-body py-4">
                                <div className="text-center mb-4">
                                    <h6 className="text-muted mb-1">Total Amount Due</h6>
                                    <h3 className="fw-bold text-dark">₹{data.amount}</h3>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Payment Status</label>
                                    <select className="form-select" {...formik.getFieldProps("payment_status")}>
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                                <div className="mb-0">
                                    <label className="form-label small fw-bold">Payment Method</label>
                                    <select className="form-select" {...formik.getFieldProps("payment_method")}>
                                        <option value="cash">Cash</option>
                                        <option value="upi">UPI / QR Code</option>
                                        <option value="card">Credit/Debit Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary px-4">Update Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}