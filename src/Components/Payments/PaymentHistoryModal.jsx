import { useEffect, useState } from "react";
import apiRequest from "../../Services/apiRequest";

export default function PaymentHistoryModal({
  show,
  handleClose,
  invoiceId,
}) {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (invoiceId && show) fetchPayments();
  }, [invoiceId, show]);

  const fetchPayments = async () => {
    const res = await apiRequest.get("/payment");

    if (res.status === "success") {
      const filtered = res.result.filter(
        (p) => p.invoiceId === invoiceId
      );
      setPayments(filtered);
    }
  };

  const totalPaid = payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Payment History</h5>
              <button className="btn-close" onClick={handleClose}></button>
            </div>

            <div className="modal-body">
              <table className="table table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.payment_date?.substring(0, 10)}</td>
                      <td>₹ {p.amount}</td>
                      <td>{p.payment_mode}</td>
                      <td>{p.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h6 className="text-end text-success">
                Total Paid: ₹ {totalPaid}
              </h6>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}