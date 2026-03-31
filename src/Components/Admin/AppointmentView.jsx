import React from "react";
import logo from "../../assets/logo.png";

export default function AppointmentView({ data, onBack }) {
    // Safely access deep nested properties
    const member = data.Member || {};
    const pkg = data.Package || {};

    return (
        <div className="container-fluid py-4 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
                    <i className="fa-solid fa-arrow-left me-2"></i> Back to Appointments
                </button>
                <div className="d-flex gap-2">
                    <button className="btn btn-danger btn-sm px-3">
                        <i className="fa-solid fa-file-pdf me-2"></i>Download Invoice
                    </button>
                </div>
            </div>

            <div className="row g-4">
                {/* Profile Section */}
                <div className="col-lg-3">
                    <div className="card border-0 shadow-sm p-4 text-center h-100">
                        <div className="mb-3">
                           {/* 👇 NAYA: Profile Image Logic */}
                            {member.profile_image ? (
                                <img 
                                    src={`${API_BASE_URL}${member.profile_image.replace(/\\/g, "/")}`} 
                                    alt={member.name} 
                                    style={{ 
                                        width: "120px", 
                                        height: "120px", 
                                        borderRadius: "50%", 
                                        objectFit: "cover",
                                        border: "4px solid #f8f9fa",
                                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                                    }} 
                                />
                            ) : (
                                <img src={logo} alt="Octane Logo" style={{ maxWidth: "150px" }} />
                            )}
                        </div>
                        <h4 className="fw-bold mb-0">{member.name}</h4>
                        <div className="badge bg-light text-muted mb-4 border">GYM</div>
                        
                        <div className="text-start border-top pt-3">
                            <h6 className="fw-bold mb-3">Customer</h6>
                            <p className="small mb-2"><strong>Email:</strong> {member.email || "N/A"}</p>
                            <p className="small mb-2"><strong>Mobile:</strong> {member.mobile || "N/A"}</p>
                            <p className="small mb-2">
                                <strong>Status:</strong> 
                                <span className="text-success fw-bold ms-1">
                                    {member.status || "Active"}
                                </span>
                            </p>
                            {/* Replace these with your actual API fields */}
                            <p className="small mb-2"><strong>DOB:</strong> {member.dob || "N/A"}</p>
                            <p className="small mb-0"><strong>Gender:</strong> {member.gender || "N/A"}</p>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="col-lg-9">
                    {/* Appointment Details */}
                    <div className="card border-0 shadow-sm p-4 mb-4">
                        <h6 className="text-primary fw-bold mb-4 border-bottom pb-2">Appointment Details</h6>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="text-muted small d-block">Package</label>
                                <span className="fw-bold">{pkg.title}</span>
                            </div>
                            <div className="col-md-3">
                                <label className="text-muted small d-block">Type</label>
                                <span className="fw-bold">{data.appointment_type || "General"}</span>
                            </div>
                            <div className="col-md-3">
                                <label className="text-muted small d-block">Appointment Status</label>
                                <span className="badge bg-success">{data.status || "Accept"}</span>
                            </div>
                            <div className="col-md-3">
                                <label className="text-muted small d-block">Session Code</label>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge bg-dark">{data.session_code || "Pending"}</span>
                                    <i className="fa-solid fa-qrcode"></i>
                                </div>
                            </div>
                            <div className="col-md-3 mt-4">
                                <label className="text-muted small d-block">Appointment Date</label>
                                <span className="fw-bold">{data.date}</span>
                            </div>
                            <div className="col-md-3 mt-4">
                                <label className="text-muted small d-block">Appointment Time</label>
                                <span className="fw-bold">{data.slot}</span>
                            </div>
                            <div className="col-md-6 mt-4">
                                <label className="text-muted small d-block">Appointment Remark</label>
                                <span className="fw-bold text-muted">{data.remark || "-"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="card border-0 shadow-sm p-4">
                        <h6 className="text-primary fw-bold mb-4 border-bottom pb-2">Payment Details</h6>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="text-muted small d-block">Package Amount</label>
                                <span className="fw-bold">₹{data.amount}</span>
                            </div>
                            <div className="col-md-3">
                                <label className="text-muted small d-block">Discount</label>
                                <span className="fw-bold">₹{data.discount || "0.00"}</span>
                            </div>
                            <div className="col-md-3">
                                <label className="text-muted small d-block">Pay Amount</label>
                                <span className="fw-bold">₹{data.paid_amount || data.amount}</span>
                            </div>
                            <div className="col-md-3">
                                <label className="text-muted small d-block">Due Balance</label>
                                <span className="fw-bold">₹{data.due_balance || "0"}</span>
                            </div>
                            <div className="col-md-3 mt-4">
                                <label className="text-muted small d-block">Invoice Status</label>
                                <span className={`badge ${data.payment_status?.toLowerCase() === 'paid' ? 'bg-success' : 'bg-danger'}`}>
                                    {data.payment_status?.toUpperCase()}
                                </span>
                            </div>
                            <div className="col-md-3 mt-4">
                                <label className="text-muted small d-block">Invoice Number</label>
                                <span className="text-primary fw-bold"># {data.invoice_no || data.id + 1000}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}