import { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { rootContext } from "../../App";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";
import MemberModal from "../../Components/Modals/MemberModal";
import styled from "styled-components";

export default function AddUserMembership({
  show,
  handleClose,
  onSuccess,
  editData,
}) {
  const rootCtx = useContext(rootContext);
  const navigate = useNavigate();
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [memberFilterText, setMemberFilterText] = useState("");
  const [filterText, setFilterText] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);

  const [packageTotalAmount, setPackageTotalAmount] = useState(0);

  // =========================
  // VALIDATION
  // =========================
  const membershipSchema = Yup.object({
    member_id: Yup.string().required("Required"),
    membershippackage_id: Yup.string().required("Required"),
    status: Yup.string().required("Required"),
    start_at: Yup.date().required("Required"),
    end_at: Yup.date()
      .min(Yup.ref("start_at"), "End date must be after start date")
      .required("Required"),
    trainer_assigned: Yup.string().required("Required"),
    amount_paying_now: Yup.number()
      .min(0, "Amount cannot be negative")
      .max(packageTotalAmount, "Amount cannot exceed package total"),
  });

  // =========================
  // FORMIK
  // =========================
  const formik = useFormik({
    initialValues: {
      member_id: "",
      email: "",
      mobile: "",
      membershippackage_id: "",
      status: "active",
      start_at: "",
      end_at: "",
      amount_paying_now: "",
      payment_mode: "cash",
      trainer_assigned: "no",
    },
    enableReinitialize: true,
    validationSchema: membershipSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        rootCtx[0](true);

        const payload = {
          member_id: values.member_id,
          membershippackage_id: values.membershippackage_id,
          status: values.status,
          start_at: values.start_at,
          end_at: values.end_at,
          trainer_assigned: values.trainer_assigned,
          amount_paying_now: parseFloat(values.amount_paying_now) || 0,
          payment_mode: values.payment_mode,
        };

        const response = await apiRequest.post(
          "usermembership/",
          payload,
        );

        if (response.status === "success") {
          alert.success("Membership Added Successfully", "Octane Fit City");
          resetForm();
          navigate("/Admin/user-membership");
        } else {
          alert.error(response.message || "Failed to add membership");
        }
      } catch (error) {
        alert.error(error?.response?.data?.message || "Something went wrong");
      } finally {
        rootCtx[0](false);
        setSubmitting(false);
      }
    },
  });

  const formatNumber = (num) => {
    return Number(num) ? Number(num).toFixed(2) : "0.00";
  };

  const handlePackageSelect = (pkg) => {
    const total = Number(pkg.selling_price || pkg.price || 0);
    setPackageTotalAmount(total);
    formik.setFieldValue("membershippackage_id", pkg.id);
    setSelectedPackage(pkg);
  };

  const currentPaying = parseFloat(formik.values.amount_paying_now) || 0;
  const remainingAmount = packageTotalAmount > 0 ? packageTotalAmount - currentPaying : 0;

  // =========================
  // FETCH MEMBERS & PACKAGES
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const memberRes = await apiRequest.get("member/get-member");
        const packageRes = await apiRequest.get("membershippackage/get-membershippackages");
        if (memberRes.status === "success") setMembers(memberRes.result || []);
        if (packageRes.status === "success") setPackages(packageRes.result || []);
      } catch (err) {
        console.log("Dropdown fetch error:", err);
      }
    };
    fetchData();
  }, []);

  const refreshMembers = async () => {
    try {
      const memberRes = await apiRequest.get("member/get-member");
      if (memberRes.status === "success") setMembers(memberRes.result || []);
    } catch (err) {
      console.error("Refresh members error:", err);
    }
  };

  return (
    <Container>
      <HeaderSection>
        <div>
          <PageTitle>
            Memberships <span>/ Assign New</span>
          </PageTitle>
          <Sub>Enroll a member into a new package and collect payment.</Sub>
        </div>
        <BackBtn type="button" onClick={() => navigate("/Admin/user-membership")}>
          <i className="bi bi-arrow-left" /> Back to List
        </BackBtn>
      </HeaderSection>

      <MainCard>
        <form onSubmit={formik.handleSubmit}>
          <CardBody>
            {/* ================= MEMBER SECTION ================= */}
            <SectionBlock>
              <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                <FormLabel className="mb-0">
                  Select Member <small>(Click box to change)</small>
                </FormLabel>
                <AddLink onClick={() => setShowMemberModal(true)}>
                  <i className="bi bi-plus-circle-fill me-1"></i> Add New Member
                </AddLink>
              </div>

              <MemberModal
                show={showMemberModal}
                handleClose={() => setShowMemberModal(false)}
                onSuccess={(newMember) => {
                  formik.setFieldValue("member_id", newMember.id);
                  formik.setFieldValue("email", newMember.email || "");
                  formik.setFieldValue("mobile", newMember.mobile || "");
                  setSelectedMember(newMember);
                  refreshMembers();
                }}
              />

              <DropdownWrapper>
                {selectedMember ? (
                  <SelectionBox onClick={() => setShowMemberDropdown(true)}>
                    <div className="content-wrap">
                      <AvatarBox>{selectedMember.name.charAt(0).toUpperCase()}</AvatarBox>
                      <div className="info">
                        <h6>{selectedMember.name}</h6>
                        <p>
                          <i className="bi bi-telephone-fill"></i> {selectedMember.mobile || "N/A"}
                          <span className="divider">|</span>
                          <i className="bi bi-envelope-fill"></i> {selectedMember.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    <i className="bi bi-chevron-down text-muted"></i>
                  </SelectionBox>
                ) : (
                  <EmptySelectionBox onClick={() => setShowMemberDropdown(true)}>
                    <span className="text"><i className="bi bi-person-lines-fill"></i> Choose a Member...</span>
                    <i className="bi bi-chevron-down"></i>
                  </EmptySelectionBox>
                )}

                {showMemberDropdown && (
                  <>
                    <DropdownMenu>
                      <div className="search-box">
                        <i className="bi bi-search"></i>
                        <input
                          type="text"
                          placeholder="Search by name, email, mobile..."
                          value={memberFilterText}
                          onChange={(e) => setMemberFilterText(e.target.value)}
                          autoFocus
                        />
                        {memberFilterText && (
                          <button type="button" onClick={() => setMemberFilterText("")}><i className="bi bi-x"></i></button>
                        )}
                      </div>
                      <ListContainer>
                        {members.filter((m) => {
                          const s = memberFilterText.toLowerCase();
                          return m.name.toLowerCase().includes(s) || (m.mobile || "").includes(s) || (m.email || "").toLowerCase().includes(s);
                        }).map((member) => (
                          <ListItem
                            key={member.id}
                            $active={member.id.toString() === formik.values.member_id}
                            onClick={() => {
                              formik.setFieldValue("member_id", member.id);
                              setSelectedMember(member);
                              setShowMemberDropdown(false);
                              setMemberFilterText("");
                            }}
                          >
                            <div className="list-avatar">{member.name.charAt(0).toUpperCase()}</div>
                            <div className="list-info">
                              <b>{member.name}</b>
                              <span>{member.mobile} • {member.email}</span>
                            </div>
                            {member.id.toString() === formik.values.member_id && <i className="bi bi-check-circle-fill check-icon"></i>}
                          </ListItem>
                        ))}
                      </ListContainer>
                    </DropdownMenu>
                    <Overlay onClick={() => setShowMemberDropdown(false)} />
                  </>
                )}
              </DropdownWrapper>
            </SectionBlock>

            {/* ================= PACKAGE SECTION ================= */}
            <SectionBlock>
              <FormLabel>
                Select Membership Package <small>(Click box to change)</small>
              </FormLabel>

              <DropdownWrapper>
                {selectedPackage ? (
                  <SelectionBox onClick={() => setShowPackageDropdown(true)}>
                    <div className="content-wrap">
                      <IconBox><i className="bi bi-box-seam" /></IconBox>
                      <div className="info">
                        <h6>{selectedPackage.title || selectedPackage.name}</h6>
                        <p className="desc">{selectedPackage.description || "No description available"}</p>
                        <PriceBadge>Package Total: ₹{formatNumber(packageTotalAmount)}</PriceBadge>
                      </div>
                    </div>
                    <i className="bi bi-chevron-down text-muted"></i>
                  </SelectionBox>
                ) : (
                  <EmptySelectionBox onClick={() => setShowPackageDropdown(true)}>
                    <span className="text"><i className="bi bi-box-seam"></i> Choose a Package...</span>
                    <i className="bi bi-chevron-down"></i>
                  </EmptySelectionBox>
                )}

                {showPackageDropdown && (
                  <>
                    <DropdownMenu>
                      <div className="search-box">
                        <i className="bi bi-search"></i>
                        <input
                          type="text"
                          placeholder="Search package..."
                          value={filterText}
                          onChange={(e) => setFilterText(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <ListContainer>
                        {packages.filter((p) => {
                          const s = filterText.toLowerCase();
                          return (p.title || p.name).toLowerCase().includes(s);
                        }).map((pkg) => (
                          <ListItem
                            key={pkg.id}
                            $active={pkg.id === parseInt(formik.values.membershippackage_id)}
                            onClick={() => {
                              handlePackageSelect(pkg);
                              setShowPackageDropdown(false);
                              setFilterText("");
                            }}
                          >
                            <div className="list-info">
                              <b>{pkg.title || pkg.name}</b>
                              <span>{pkg.description}</span>
                            </div>
                            <div className="list-price">₹{formatNumber(pkg.selling_price || pkg.price)}</div>
                            {pkg.id === parseInt(formik.values.membershippackage_id) && <i className="bi bi-check-circle-fill check-icon"></i>}
                          </ListItem>
                        ))}
                      </ListContainer>
                    </DropdownMenu>
                    <Overlay onClick={() => setShowPackageDropdown(false)} />
                  </>
                )}
              </DropdownWrapper>
            </SectionBlock>

            {/* ================= NEW PAYMENT SECTION ================= */}
            <PaymentCard>
              <div className="pay-header">
                <h5><i className="bi bi-credit-card-2-front-fill me-2"></i> Initial Payment Details</h5>
                {packageTotalAmount > 0 && (
                  <RemainingBadge $paid={remainingAmount === 0}>
                    {remainingAmount === 0 ? "Fully Paid ✓" : `Remaining: ₹${formatNumber(remainingAmount)}`}
                  </RemainingBadge>
                )}
              </div>
              <div className="pay-body">
                <GridRow>
                  <FormGroup>
                    <FormLabel>Paying Amount (₹)</FormLabel>
                    <InputGroup>
                      <span className="prefix">₹</span>
                      <FormInput
                        type="number"
                        placeholder="0.00"
                        max={packageTotalAmount}
                        step="0.01"
                        $error={formik.errors.amount_paying_now && formik.touched.amount_paying_now}
                        {...formik.getFieldProps("amount_paying_now")}
                      />
                    </InputGroup>
                    {formik.touched.amount_paying_now && formik.errors.amount_paying_now && (
                      <ErrorText>{formik.errors.amount_paying_now}</ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Payment Mode</FormLabel>
                    <FormSelect {...formik.getFieldProps("payment_mode")}>
                      <option value="cash">💵 Cash</option>
                      <option value="card">💳 Card</option>
                      <option value="upi">📱 UPI</option>
                    </FormSelect>
                  </FormGroup>
                </GridRow>
              </div>
            </PaymentCard>

            {/* ================= OTHER SETTINGS ================= */}
            <SettingsGrid>
              <FormGroup>
                <FormLabel>Status</FormLabel>
                <FormSelect {...formik.getFieldProps("status")}>
                  <option value="active">🟢 Active</option>
                  <option value="inactive">🔴 Inactive</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>Assign Trainer?</FormLabel>
                <FormSelect {...formik.getFieldProps("trainer_assigned")}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>Start Date</FormLabel>
                <FormInput
                  type="date"
                  $error={formik.errors.start_at && formik.touched.start_at}
                  {...formik.getFieldProps("start_at")}
                />
                {formik.touched.start_at && formik.errors.start_at && (
                  <ErrorText>{formik.errors.start_at}</ErrorText>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel>End Date</FormLabel>
                <FormInput
                  type="date"
                  $error={formik.errors.end_at && formik.touched.end_at}
                  {...formik.getFieldProps("end_at")}
                />
                {formik.touched.end_at && formik.errors.end_at && (
                  <ErrorText>{formik.errors.end_at}</ErrorText>
                )}
              </FormGroup>
            </SettingsGrid>

          </CardBody>

          <CardFooter>
            <CancelBtn type="button" onClick={() => navigate("/Admin/user-membership")}>Cancel</CancelBtn>
            <SubmitBtn type="submit" disabled={formik.isSubmitting || !packageTotalAmount}>
              {formik.isSubmitting ? "Processing..." : "Save Membership"}
            </SubmitBtn>
          </CardFooter>
        </form>
      </MainCard>
    </Container>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Styled Components matched to AdminMasterPage Theme
// ────────────────────────────────────────────────────────────────────────────

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeUp 0.3s ease-in-out;
  padding-bottom: 40px;

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PageTitle = styled.h3`
  font-family: var(--font-ui);
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--th);
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;

  span {
    font-family: var(--font-serif);
    font-style: italic;
    font-weight: 400;
    font-size: 1.4rem;
    color: var(--tm);
  }
`;

const Sub = styled.p`
  font-family: var(--font-ui);
  font-size: 0.8rem;
  color: var(--tm);
  margin: 0;
`;

const BackBtn = styled.button`
  background: var(--white);
  border: 1px solid var(--border2);
  color: var(--tb);
  padding: 8px 16px;
  border-radius: var(--r1);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: var(--bg);
    border-color: var(--tm);
  }

  @media (max-width: 576px) {
    width: 100%;
    justify-content: center;
  }
`;

const MainCard = styled.div`
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const CardBody = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 576px) {
    padding: 20px 16px;
  }
`;

const SectionBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--th);
  margin-bottom: 8px;

  small {
    font-weight: 500;
    color: var(--tm);
    margin-left: 6px;
  }
`;

const AddLink = styled.span`
  color: var(--g1);
  font-family: var(--font-ui);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  &:hover { color: var(--g2); text-decoration: underline; }
`;

/* ── DROPDOWN & SELECTION STYLES ── */

const DropdownWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SelectionBox = styled.div`
  background: var(--grad-soft);
  border: 1px solid rgba(255, 107, 43, 0.3);
  border-radius: var(--r1);
  padding: 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    background: var(--grad-hover);
    border-color: var(--g1);
  }

  .content-wrap {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .info h6 {
    font-family: var(--font-ui);
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--g1);
    margin: 0 0 4px;
  }

  .info p {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    color: var(--tb);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    i { color: var(--tm); }
    .divider { color: var(--border2); }
  }

  .desc {
    color: var(--tm);
  }

  @media (max-width: 576px) {
    padding: 12px;
    .content-wrap { gap: 12px; }
    .info h6 { font-size: 0.95rem; }
    .info p { font-size: 0.75rem; flex-wrap: wrap; }
  }
`;

const EmptySelectionBox = styled.div`
  background: var(--bg);
  border: 1px dashed var(--border2);
  border-radius: var(--r1);
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: 0.2s;

  .text {
    font-family: var(--font-ui);
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--tm);
    i { margin-right: 8px; font-size: 1.1rem; }
  }

  &:hover {
    border-color: var(--tm);
    background: var(--white);
    .text { color: var(--tb); }
  }

  @media (max-width: 576px) {
    padding: 12px 16px;
    .text { font-size: 0.8rem; }
  }
`;

const AvatarBox = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--grad);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-ui);
  font-weight: 800;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const IconBox = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--grad);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
`;

const PriceBadge = styled.span`
  display: inline-block;
  background: var(--th);
  color: var(--white);
  padding: 4px 10px;
  border-radius: 4px;
  font-family: var(--font-ui);
  font-size: 0.75rem;
  font-weight: 700;
  margin-top: 8px;
  letter-spacing: 0.5px;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  margin-top: 8px;
  background: var(--white);
  border: 1px solid var(--border2);
  border-radius: var(--r2);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  overflow: hidden;
  animation: slideIn 0.2s ease;

  .search-box {
    padding: 12px;
    border-bottom: 1px solid var(--border);
    position: relative;
    background: var(--bg);

    i.bi-search {
      position: absolute;
      left: 24px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--tm);
    }

    input {
      width: 100%;
      padding: 10px 10px 10px 36px;
      border: 1px solid var(--border2);
      border-radius: var(--r1);
      font-family: var(--font-ui);
      font-size: 0.85rem;
      outline: none;
      &:focus { border-color: var(--g2); }
    }

    button {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: var(--tm);
      cursor: pointer;
    }
  }
`;

const ListContainer = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
`;

const ListItem = styled.li`
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: 0.2s;
  background: ${({ $active }) => $active ? "var(--grad-soft)" : "var(--white)"};

  &:hover {
    background: var(--bg);
  }

  .list-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--border2);
    color: var(--th);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .list-info {
    flex: 1;
    display: flex;
    flex-direction: column;

    b {
      font-family: var(--font-ui);
      font-size: 0.9rem;
      color: var(--th);
    }
    span {
      font-family: var(--font-ui);
      font-size: 0.75rem;
      color: var(--tm);
    }
  }

  .list-price {
    font-family: var(--font-ui);
    font-weight: 800;
    color: var(--tb);
    font-size: 0.9rem;
  }

  .check-icon {
    color: var(--g1);
    font-size: 1.2rem;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
`;

/* ── FORM ELEMENTS ── */

const PaymentCard = styled.div`
  border: 1px solid var(--border2);
  border-radius: var(--r2);
  overflow: hidden;

  .pay-header {
    background: var(--bg);
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h5 {
      margin: 0;
      font-family: var(--font-ui);
      font-size: 1rem;
      font-weight: 800;
      color: var(--th);
    }

    @media (max-width: 576px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }

  .pay-body {
    padding: 20px;
  }
`;

const RemainingBadge = styled.span`
  background: ${({ $paid }) => $paid ? "#dcfce7" : "#fef3c7"};
  color: ${({ $paid }) => $paid ? "#16a34a" : "#d97706"};
  padding: 6px 14px;
  border-radius: 20px;
  font-family: var(--font-ui);
  font-size: 0.8rem;
  font-weight: 800;
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  background: var(--bg);
  padding: 20px;
  border-radius: var(--r2);
  border: 1px solid var(--border2);

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: stretch;
  border: 1px solid var(--border2);
  border-radius: var(--r1);
  overflow: hidden;
  transition: 0.2s;

  &:focus-within {
    border-color: var(--g2);
    box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1);
  }

  .prefix {
    background: var(--bg);
    padding: 0 16px;
    display: flex;
    align-items: center;
    color: var(--tm);
    font-weight: 700;
    border-right: 1px solid var(--border2);
  }

  input {
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
`;

const FormBase = `
  width: 100%;
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--tb);
  background: var(--white);
  border: 1px solid var(--border2);
  border-radius: var(--r1);
  padding: 10px 14px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: var(--g2);
    box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1);
  }
`;

const FormInput = styled.input`
  ${FormBase}
  ${({ $error }) => $error && `border-color: #ef4444; background: #fef2f2;`}
`;

const FormSelect = styled.select`
  ${FormBase}
  cursor: pointer;
`;

const ErrorText = styled.small`
  color: #ef4444;
  font-family: var(--font-ui);
  font-size: 0.75rem;
  margin-top: 4px;
  font-weight: 600;
`;

const CardFooter = styled.div`
  background: var(--bg);
  padding: 16px 30px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  @media (max-width: 576px) {
    flex-direction: column;
    padding: 16px;
    button {
      width: 100%;
    }
  }
`;

const CancelBtn = styled.button`
  background: var(--white);
  border: 1px solid var(--border2);
  color: var(--tb);
  padding: 10px 20px;
  border-radius: var(--r1);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: var(--border);
  }
`;

const SubmitBtn = styled.button`
  background: var(--grad);
  color: var(--white);
  border: none;
  padding: 10px 24px;
  border-radius: var(--r1);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 15px rgba(255, 74, 110, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 74, 110, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--border2);
    box-shadow: none;
    transform: none;
    color: var(--tm);
  }
`;