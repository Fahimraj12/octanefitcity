import React, { useState, useEffect } from "react";
import styled from "styled-components";
import apiRequest from "../../Services/apiRequest"; 
import alert from "../../Services/SweetAlert"; 

export default function FinancialYear() {
  // --- STATES ---
  const [formData, setFormData] = useState({
    name: "",
    date_start: "",
    date_end: "",
  });
  const [yearsList, setYearsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchFinancialYears();
    // Dependency array empty hai, iska matlab ye component load hone par sirf ek baar chalega
  }, []);

  // --- 1. FETCH API LOGIC ---
  const fetchFinancialYears = async () => {
    setLoading(true);
    try {
      const response = await apiRequest.get("financialYear"); 
      const data = response.result || response.data || response; 
      
      if (data && Array.isArray(data)) {
        setYearsList(data);
        
        // NAYA LOGIC: Jo active hai use save karo taaki baki components usko use kar sakein
        const activeYear = data.find(year => year.is_active === true);
        if (activeYear) {
          localStorage.setItem("activeFinancialYearId", activeYear.id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch financial years", error);
      alert.error("Failed to load financial years.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. FORM HANDLER ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 3. SAVE NEW FINANCIAL YEAR LOGIC ---
  const handleSave = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.date_start >= formData.date_end) {
        alert.error("End date must be after Start date");
        return;
    }

    try {
      const response = await apiRequest.post("financialYear", formData);
      
      if (response) {
        alert.success("Financial Year added successfully!");
        setFormData({ name: "", date_start: "", date_end: "" }); // Reset form
        fetchFinancialYears(); // Naya data aane par list refresh karo
      }
    } catch (error) {
      console.error("Error saving financial year:", error);
      alert.error("Failed to save. Please try again.");
    }
  };

  // --- 4. MARK AS ACTIVE LOGIC ---
  const handleMakeActive = async (id) => {
    // Optional: User se confirm karwa lein (achhi practice hai)
    const isConfirmed = window.confirm("Are you sure you want to make this the active financial year for all new entries?");
    if (!isConfirmed) return;

    try {
      const response = await apiRequest.put(`financialYear/make-active/${id}`); 
      
      if (response) {
        alert.success("Financial Year Activated!");
        
        // Naye active saal ko local storage mein turant update karo
        localStorage.setItem("activeFinancialYearId", id);
        
        // List refresh karein taaki status UI mein update ho jaye
        fetchFinancialYears(); 
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert.error("Failed to update status.");
    }
  };

  return (
    <Wrapper>
      {/* PAGE HEADER */}
      <HeaderSection>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Title>
            Finance <span>/ Financial Year</span>
          </Title>
          <SubTitle>Manage Financial Year Records</SubTitle>
        </div>
        <Breadcrumbs>
          <i className="fa-solid fa-house" /> Home / Finance Settings / <b>Financial Year</b>
        </Breadcrumbs>
      </HeaderSection>

      {/* ADD FINANCIAL YEAR FORM */}
      <Card>
        <CardHeader>Add Financial Year</CardHeader>
        <Form onSubmit={handleSave}>
          <InputRow>
            <FormGroup>
              <Label>Year Name <span>*</span></Label>
              <Input
                type="text"
                name="name" 
                placeholder="e.g. 2025-2026"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Date From <span>*</span></Label>
              <Input
                type="date"
                name="date_start" 
                value={formData.date_start}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Date To <span>*</span></Label>
              <Input
                type="date"
                name="date_end" 
                value={formData.date_end}
                onChange={handleChange}
                required
              />
            </FormGroup>
          </InputRow>
          
          <ActionButtons>
            <CancelButton type="button" onClick={() => setFormData({ name: "", date_start: "", date_end: "" })}>
              <i className="fa-solid fa-xmark" /> Cancel
            </CancelButton>
            <SaveButton type="submit">
              <i className="fa-solid fa-plus" /> Save
            </SaveButton>
          </ActionButtons>
        </Form>
      </Card>

      {/* FINANCIAL YEAR LIST */}
      <Card>
        <CardHeader>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="fa-regular fa-calendar-days" /> 
            Financial Year List
          </div>
          <Badge>Total: {yearsList.length}</Badge>
        </CardHeader>

        {/* Toolbar (Search & Filters) */}
        <Toolbar>
          <SearchGroup>
            <i className="fa-solid fa-magnifying-glass" />
            <input type="text" placeholder="Search by Year Name..." />
          </SearchGroup>
          <DateFilterGroup>
            <span className="label">from</span>
            <Input type="date" style={{ padding: "6px 10px" }} />
            <span className="label">to</span>
            <Input type="date" style={{ padding: "6px 10px" }} />
            <ClearButton>
               <i className="fa-solid fa-xmark" /> Clear
            </ClearButton>
          </DateFilterGroup>
        </Toolbar>

        {/* Data Table */}
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th width="80" className="text-center">ID</th>
                <th>YEAR NAME</th>
                <th>DATE FROM</th>
                <th>DATE TO</th>
                <th className="text-center">STATUS</th>
                <th width="100" className="text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr>
                   <td colSpan="6" style={{ textAlign: "center", padding: "40px 20px" }}>
                      <span style={{ fontFamily: "var(--font-ui)", color: "var(--tm)" }}>Loading data...</span>
                   </td>
                 </tr>
              ) : yearsList.length > 0 ? (
                yearsList.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">#{index + 1}</td>
                    <td><b style={{ color: "var(--th)" }}>{item.name}</b></td>
                    <td>{item.date_start}</td>
                    <td>{item.date_end}</td>
                    <td className="text-center">
                      <StatusBadge 
                        $active={item.is_active}
                        onClick={() => !item.is_active && handleMakeActive(item.id)}
                        style={{ cursor: item.is_active ? 'default' : 'pointer' }}
                        title={!item.is_active ? "Click to set as Active" : ""}
                      >
                        {item.is_active ? <i className="fa-solid fa-check" /> : <i className="fa-solid fa-power-off" />}
                        {item.is_active ? "Active" : "Mark Active"}
                      </StatusBadge>
                    </td>
                    <td className="text-center">
                      <EditButton>
                        <i className="fa-solid fa-pen-to-square" />
                      </EditButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "40px 20px" }}>
                    <span style={{ fontFamily: "var(--font-ui)", color: "var(--tm)" }}>No Financial Years found.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </Card>
    </Wrapper>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  STYLED COMPONENTS (Matched to AdminMasterPage Theme)
// ────────────────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeUp 0.3s ease-in-out;
  padding-bottom: 20px;

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
`;

const Title = styled.h3`
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

const SubTitle = styled.p`
  font-family: var(--font-ui);
  font-size: 0.8rem;
  color: var(--tm);
  margin: 0;
`;

const Breadcrumbs = styled.div`
  font-family: var(--font-ui);
  font-size: 0.85rem;
  color: var(--tm);

  i {
    color: var(--g1); 
  }

  b {
    color: var(--th);
  }
`;

const Card = styled.div`
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 16px 20px;
  font-family: var(--font-ui);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--th);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const Badge = styled.span`
  background: var(--bg);
  color: var(--tm);
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid var(--border2);
  font-family: var(--font-ui);
  font-weight: 700;
`;

const Form = styled.form`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-family: var(--font-ui);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--tm);
  letter-spacing: 0.5px;

  span {
    color: #ef4444; 
  }
`;

const Input = styled.input`
  width: 100%;
  font-family: var(--font-ui);
  font-size: 0.85rem;
  color: var(--tb);
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: var(--r1);
  padding: 10px 14px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    background: var(--white);
    border-color: var(--g2);
    box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 10px;
`;

const CancelButton = styled.button`
  background: transparent;
  color: var(--tm);
  border: 1px solid var(--border2);
  padding: 10px 20px;
  border-radius: var(--r2);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: var(--bg);
    color: var(--th);
  }
`;

const SaveButton = styled.button`
  background: var(--grad);
  color: var(--white);
  border: none;
  padding: 10px 20px;
  border-radius: var(--r2);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 74, 110, 0.3);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 74, 110, 0.4);
  }
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 16px;
  background: var(--white);
`;

const SearchGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: var(--r1);
  padding: 8px 14px;
  flex: 1;
  max-width: 300px;
  transition: all 0.2s ease;

  &:focus-within {
    background: var(--white);
    border-color: var(--g2);
    box-shadow: 0 0 0 3px rgba(255, 74, 110, 0.1);
  }

  i {
    color: var(--tm);
    font-size: 0.9rem;
  }

  input {
    border: none;
    background: transparent;
    outline: none;
    font-family: var(--font-ui);
    font-size: 0.85rem;
    color: var(--tb);
    width: 100%;
  }
`;

const DateFilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .label {
    font-family: var(--font-ui);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--tm);
    letter-spacing: 0.5px;
  }
`;

const ClearButton = styled.button`
  background: transparent;
  color: var(--tm);
  border: 1px solid var(--border2);
  padding: 8px 12px;
  border-radius: var(--r1);
  font-family: var(--font-ui);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: var(--bg);
    color: var(--th);
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;

  th {
    background: var(--bg);
    font-family: var(--font-ui);
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--tm);
    letter-spacing: 0.5px;
    padding: 14px 16px;
    border-bottom: 2px solid var(--border);
    white-space: nowrap;
    
    &.text-center { text-align: center; }
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    font-family: var(--font-ui);
    color: var(--tb);
    vertical-align: middle;

    &.text-center { text-align: center; }
  }

  tbody tr {
    transition: background 0.15s;
    &:hover { background: var(--bg); }
    &:last-child td { border-bottom: none; }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  transition: all 0.2s;

  /* Using the theme colors logic */
  ${({ $active }) => $active 
    ? "background: #dcfce7; color: #16a34a;" 
    : "background: var(--bg); color: var(--tm); border: 1px solid var(--border2);"
  }

  &:hover {
    ${({ $active }) => !$active && "background: #dcfce7; color: #16a34a; border-color: transparent;"}
  }

  i { font-size: 0.75rem; }
`;

const EditButton = styled.button`
  background: transparent;
  border: none;
  color: var(--tm);
  font-size: 1.1rem;
  padding: 4px 8px;
  border-radius: var(--r1);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: var(--bg);
    color: #d97706; /* Theme warning/edit color from previous code */
  }
`;