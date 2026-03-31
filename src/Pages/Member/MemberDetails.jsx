import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import apiRequest from '../../Services/apiRequest';
import MemberModal from '../../Components/Modals/MemberModal'; // Import your modal

const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

export default function MemberDetails() {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newHeight, setNewHeight] = useState("");
    const [newWeight, setNewWeight] = useState("");
    const [isSavingBmi, setIsSavingBmi] = useState(false);
    const API_BASE_URL = "http://localhost:5000/";

    // Wrapped in useCallback so we can call it after a successful update
    const fetchMemberData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await apiRequest.get(`member/get-member/${id}`);
            const responseData = res.data || res;
            const status = responseData.status?.toUpperCase();

            if (status === "SUCCESS" || status === "OK" || responseData.result) {
                const actualMemberData = responseData.result?.result ? responseData.result.result : responseData.result;

                // ✅ NAYA CHANGE: Console log add kiya taaki aap database column names check kar sakein
                console.log("Full Member Data from API:", actualMemberData);

                setMember(actualMemberData);
            } else {
                setMember(responseData);
            }
        } catch (error) {
            console.error("Error fetching member info", error);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchMemberData();
    }, [id, fetchMemberData]);

    if (isLoading && !member) return <Loader><i className="fa-solid fa-spinner fa-spin" /> Preparing Profile...</Loader>;
    if (!member) return <ErrorBox>Member details not found.</ErrorBox>;

    // ✅ NAYA CHANGE: Backend include keys ('membership' aur 'invoices') ko handle karne ka safe logic
    const rawMembership = member.membership || member.memberships || member.UserMemberships || [];
    const membershipList = Array.isArray(rawMembership) ? rawMembership : [rawMembership].filter(Boolean);
    const invoiceList = member.invoices || member.InvoiceMasters || [];
    const handleAddBmi = async (e) => {
    e.preventDefault();
    if (!newHeight || !newWeight) return alert("Please enter both Height and Weight");
    
    setIsSavingBmi(true);
    try {
        const res = await apiRequest.post('member/add-bmi', {
            member_id: id,
            height: parseFloat(newHeight),
            weight: parseFloat(newWeight)
        });

        // ✅ FIX: yahan responseData ko sahi tarike se extract kiya gaya hai
        const responseData = res.data || res; 
        const status = responseData.status?.toUpperCase();

        if (status === "SUCCESS" || status === "OK") {
            fetchMemberData(); // Table ko turant update karne ke liye
            setNewHeight("");
            setNewWeight("");
        } else {
            alert("Failed to add record.");
        }
    } catch(err) {
        console.error("BMI Add Error:", err);
        alert("API Error: Check console for details.");
    } finally {
        setIsSavingBmi(false);
    }
};

    // Quota Logic (Frontend ke liye)
    const bmiHistoryList = member.bmi_history || member.BmiHistories || [];
    const currentYear = new Date().getFullYear();
    const freeUsedThisYear = bmiHistoryList.filter(b => b.is_free && new Date(b.check_date || b.createdAt).getFullYear() === currentYear).length;
    const freeRemaining = Math.max(0, 2 - freeUsedThisYear);
    return (
        <PageWrapper>
            {/* TABS NAVIGATION */}
            <TabNav>
                {['profile', 'membership', 'invoices'].map((tab) => (
                    <TabLink
                        key={tab}
                        $active={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'profile' && "Profile Details"}
                        {tab === 'membership' && "Membership"}
                        {tab === 'invoices' && "Invoices & Payments"}
                    </TabLink>
                ))}
            </TabNav>

            <div className="row">
                {/* LEFT SIDEBAR - PROFILE CARD */}
                <div className="col-lg-4 mb-4">
                    <ProfileCard>
                        <ImageContainer>
                            {member.profile_image ? (
                                <ProfileImg src={`${API_BASE_URL}${member.profile_image?.replace(/\\/g, "/")}`} />
                            ) : (
                                <PlaceholderAvatar><i className="fa-solid fa-user" /></PlaceholderAvatar>
                            )}
                            <StatusBadge $active={member.status?.toLowerCase() === 'active'}>
                                {member.status || 'Inactive'}
                            </StatusBadge>
                        </ImageContainer>

                        <MemberName>{member.name || 'Unknown Member'}</MemberName>
                        <MemberRole>OFC Official Member</MemberRole>

                        <InfoSection>
                            <SectionHeading>Contact Information</SectionHeading>
                            <InfoRow><strong>Email:</strong> {member.email || 'N/A'}</InfoRow>
                            <InfoRow><strong>Mobile:</strong> {member.mobile || 'N/A'}</InfoRow>
                            <InfoRow><strong>DOB:</strong> {member.dob ? member.dob.substring(0, 10) : 'N/A'}</InfoRow>
                            <InfoRow><strong>Gender:</strong> <span className="text-capitalize">{member.gender || 'N/A'}</span></InfoRow>
                        </InfoSection>

                        <GradientButton className="mt-4" onClick={() => setIsModalOpen(true)}>
                            Edit Profile
                        </GradientButton>
                    </ProfileCard>
                </div>

                {/* RIGHT CONTENT AREA */}
                <div className="col-lg-8">
                    {activeTab === 'profile' && (
                        <>
                            {/* PROFILE CARD */}
                            <ContentCard>
                                <CardHeader>
                                    <CardTitle>Fitness Metrics</CardTitle>
                                    <OutlineButton>Update Form</OutlineButton>
                                </CardHeader>
                                <MetricsGrid>
                                    <MetricItem><span>Type</span><strong>{member.fitness_type || '--'}</strong></MetricItem>
                                    <MetricItem><span>Diet</span><strong>{member.diet || '--'}</strong></MetricItem>
                                    <MetricItem><span>Level</span><strong>{member.fitness_level || '--'}</strong></MetricItem>
                                    <MetricItem><span>Blood</span><strong>{member.blood_group || '--'}</strong></MetricItem>
                                </MetricsGrid>
                            </ContentCard>

                            {/* NAYA: BMI TRACKER & HISTORY */}
                            <ContentCard>
                                <CardHeader>
                                    <CardTitle>BMI History & Tracking</CardTitle>
                                    <div style={{ backgroundColor: freeRemaining > 0 ? '#10b981' : '#ef4444', color: '#fff', padding: '6px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        {freeRemaining} Free Checks Left This Year
                                    </div>
                                </CardHeader>

                                {/* Form to Add New Record */}
                                <form onSubmit={handleAddBmi} className="d-flex gap-3 mb-4 p-3 rounded" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                                    <input
                                        type="number" className="form-control" placeholder="Height (cm)"
                                        value={newHeight} onChange={(e) => setNewHeight(e.target.value)} required
                                    />
                                    <input
                                        type="number" className="form-control" placeholder="Weight (kg)"
                                        value={newWeight} onChange={(e) => setNewWeight(e.target.value)} required
                                    />
                                    <GradientButton type="submit" disabled={isSavingBmi} style={{ width: 'auto', padding: '8px 20px' }}>
                                        {isSavingBmi ? "Saving..." : "Calculate & Save"}
                                    </GradientButton>
                                </form>

                                {/* History Table */}
                                <TableResponsive>
                                    <StyledTable>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>H / W</th>
                                                <th>BMI Score</th>
                                                <th>Category</th>
                                                <th>Type</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bmiHistoryList.length > 0 ? bmiHistoryList.map((record, i) => (
                                                <tr key={i}>
                                                    <td>{new Date(record.check_date || record.createdAt).toLocaleDateString()}</td>
                                                    <td>{record.height}cm / {record.weight}kg</td>
                                                    <td><strong>{record.bmi_score}</strong></td>
                                                    <td style={{
                                                        color: record.status === 'Normal' ? '#10b981' :
                                                            record.status === 'Underweight' ? '#eab308' : '#ef4444',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {record.status}
                                                    </td>
                                                    <td>
                                                        <TableBadge $active={record.is_free}>
                                                            {record.is_free ? "Free" : "Paid"}
                                                        </TableBadge>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="5" className="text-center">No BMI records found.</td></tr>
                                            )}
                                        </tbody>
                                    </StyledTable>
                                </TableResponsive>
                            </ContentCard>
                        </>
                    )}

                    {activeTab === 'membership' && (
                        <ContentCard>
                            <CardHeader>
                                <CardTitle>Membership History</CardTitle>
                                <OutlineButton>Renew Plan</OutlineButton>
                            </CardHeader>
                            <TableResponsive>
                                <StyledTable>
                                    <thead>
                                        <tr>
                                            <th>Plan Name</th>
                                            <th>Duration</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {membershipList.map((plan, i) => (
                                            <tr key={i}>
                                                <td className="plan-name">{plan.membershipPackage?.name || plan.plan_name || 'N/A'}</td>
                                                <td>{plan.start_at?.substring(0, 10)} to {plan.end_at?.substring(0, 10)}</td>
                                                <td>₹{plan.amount_paid || 0}</td>
                                                <td><TableBadge $active={plan.status?.toLowerCase() === 'active'}>{plan.status}</TableBadge></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </StyledTable>
                            </TableResponsive>
                        </ContentCard>
                    )}

                    {activeTab === 'invoices' && (
                        <ContentCard>
                            <CardHeader><CardTitle>Financial Records</CardTitle></CardHeader>
                            <TableResponsive>
                                <StyledTable>
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceList.map((inv, i) => (
                                            <tr key={i}>
                                                <td className="invoice-no">{inv.invoice_no || inv.id}</td>
                                                <td>{inv.receipt_date?.substring(0, 10)}</td>
                                                <td>₹{inv.net_amount || 0}</td>
                                                <td><ViewBtn><i className="bi bi-eye" /> View</ViewBtn></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </StyledTable>
                            </TableResponsive>
                        </ContentCard>
                    )}
                </div>
            </div>

            {/* INTEGRATED MODAL */}
            <MemberModal
                show={isModalOpen}
                handleClose={() => setIsModalOpen(false)}
                editData={member}
                onSuccess={() => {
                    fetchMemberData(); // Refresh data on screen after edit
                    setIsModalOpen(false);
                }}
            />
        </PageWrapper>
    );
}

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────
const PageWrapper = styled.div`animation: ${fadeIn} 0.4s ease-out;`;

const TabNav = styled.div`
    display: flex; gap: 30px; background: #fff; padding: 0 25px;
    border-radius: var(--r2); border: 1px solid var(--border);
    margin-bottom: 25px; box-shadow: var(--shadow-sm);
    overflow-x: auto;
    &::-webkit-scrollbar { display: none; }
`;

const TabLink = styled.button`
    background: none; border: none; padding: 18px 5px; white-space: nowrap;
    font-family: var(--font-ui); font-size: 0.85rem; font-weight: 700;
    color: ${props => props.$active ? 'var(--th)' : 'var(--tm)'};
    position: relative; cursor: pointer; transition: 0.2s;
    text-transform: uppercase; letter-spacing: 1px;

    &::after {
        content: ''; position: absolute; bottom: 0; left: 0; right: 0;
        height: 3px; background: var(--grad);
        transform: scaleX(${props => props.$active ? 1 : 0});
        transition: 0.3s;
    }
`;

const ProfileCard = styled.div`
    background: #fff; border-radius: var(--r3); border: 1px solid var(--border);
    padding: 40px 30px; text-align: center; box-shadow: var(--shadow-md);
`;

const ImageContainer = styled.div`
    position: relative; width: 130px; height: 130px; margin: 0 auto 20px;
`;

const ProfileImg = styled.img`
    width: 100%; height: 100%; border-radius: 35px; object-fit: cover;
    border: 4px solid var(--bg); box-shadow: var(--shadow-md);
`;

const PlaceholderAvatar = styled.div`
    width: 100%; height: 100%; border-radius: 35px; background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    font-size: 3rem; color: var(--border2);
`;

const StatusBadge = styled.span`
    position: absolute; bottom: -5px; right: -5px;
    padding: 4px 12px; border-radius: 20px; font-size: 0.65rem; font-weight: 800;
    color: #fff; background: ${props => props.$active ? '#10b981' : '#ef4444'};
    border: 3px solid #fff; text-transform: uppercase;
`;

const MemberName = styled.h3`
    font-family: var(--font-serif); font-size: 1.8rem; font-style: italic;
    background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin-bottom: 5px; text-transform: capitalize;
`;

const MemberRole = styled.p`
    font-size: 0.7rem; font-weight: 700; color: var(--tm);
    text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px;
`;

const InfoSection = styled.div`text-align: left; margin-top: 20px;`;

const SectionHeading = styled.h6`
    font-size: 0.75rem; font-weight: 800; color: var(--th);
    text-transform: uppercase; border-bottom: 1px solid var(--border);
    padding-bottom: 10px; margin-bottom: 15px; letter-spacing: 1px;
`;

const InfoRow = styled.p`
    font-size: 0.85rem; color: var(--tb); margin-bottom: 10px;
    strong { color: var(--tm); font-weight: 500; margin-right: 8px; }
`;

const GradientButton = styled.button`
    width: 100%; padding: 12px; border: none; border-radius: var(--r2);
    background: var(--grad); color: #fff; font-weight: 700;
    font-size: 0.85rem; cursor: pointer; transition: 0.3s;
    box-shadow: 0 4px 15px rgba(255, 74, 110, 0.3);
    &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 74, 110, 0.4); }
`;

const ContentCard = styled.div`
    background: #fff; border-radius: var(--r3); border: 1px solid var(--border);
    padding: 30px; box-shadow: var(--shadow-md); margin-bottom: 25px;
`;

const CardHeader = styled.div`
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;
`;

const CardTitle = styled.h5`
    font-family: var(--font-serif); font-size: 1.4rem; font-style: italic;
    color: var(--th); margin: 0;
`;

const MetricsGrid = styled.div`
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
    @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
`;

const MetricItem = styled.div`
    padding: 20px; background: var(--bg); border-radius: var(--r2); text-align: center;
    span { display: block; font-size: 0.65rem; font-weight: 800; color: var(--tm); text-transform: uppercase; margin-bottom: 5px; }
    strong { font-size: 1rem; color: var(--th); }
`;

const TableResponsive = styled.div`overflow-x: auto;`;

const StyledTable = styled.table`
    width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 500px;
    thead th { 
        font-size: 0.7rem; font-weight: 800; color: var(--tm); 
        text-transform: uppercase; padding: 10px 15px;
    }
    tbody tr { background: var(--bg); transition: 0.2s; }
    tbody td { 
        padding: 15px; font-size: 0.85rem; color: var(--tb);
        &:first-child { border-radius: var(--r1) 0 0 var(--r1); }
        &:last-child { border-radius: 0 var(--r1) var(--r1) 0; }
    }
    .plan-name, .invoice-no { font-weight: 700; color: var(--th); }
`;

const TableBadge = styled.span`
    padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: capitalize;
    background: ${props => props.$active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 144, 170, 0.1)'};
    color: ${props => props.$active ? '#10b981' : 'var(--tm)'};
`;

const ViewBtn = styled.button`
    background: #fff; border: 1px solid var(--border); padding: 5px 12px;
    border-radius: 6px; font-size: 0.75rem; color: var(--tm); transition: 0.2s;
    &:hover { border-color: var(--g1); color: var(--g1); }
`;

const OutlineButton = styled.button`
    background: none; border: 1px solid var(--border2); padding: 6px 16px;
    border-radius: var(--r1); font-size: 0.75rem; font-weight: 700; color: var(--tm);
    &:hover { border-color: var(--g1); color: var(--g1); }
`;

const Loader = styled.div`text-align: center; padding: 100px; color: var(--tm); font-family: var(--font-serif); font-size: 1.5rem;`;
const ErrorBox = styled.div`text-align: center; padding: 50px; color: #ef4444; font-weight: 600;`;