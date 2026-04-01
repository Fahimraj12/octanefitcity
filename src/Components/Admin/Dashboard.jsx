import React, { useEffect, useState, useContext } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";
import styled from "styled-components";
import { rootContext } from "../../App";
import apiRequest from "../../Services/apiRequest";
import alert from "../../Services/SweetAlert";

export default function Dashboard() {
    const rootCtx = useContext(rootContext);

    const [stats, setStats] = useState({
        totalMembers: 0, activeMemberships: 0, expiringSoon: 0, totalRevenue: 0, todaysRevenue: 0,
        totalAdmins: 0, totalTrainers: 0, activeTrainers: 0, inactiveTrainers: 0,
    });

    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [monthlyMembers, setMonthlyMembers] = useState([]);
    const [membershipDistribution, setMembershipDistribution] = useState([]);

    useEffect(() => {
        fetchOverview();
        // eslint-disable-next-line
    }, []);

    const fetchOverview = async () => {
        try {
            rootCtx[0](true);
            const response = await apiRequest.get("dashboard/overview");
            if (response.success) {
                const data = response.data;
                setStats({
                    totalMembers: data?.totalMembers ?? 0,
                    activeMemberships: data?.activeMemberships ?? 0,
                    expiringSoon: data?.expiringSoon ?? 0,
                    totalRevenue: data?.totalRevenue ?? 0,
                    todaysRevenue: data?.todaysRevenue ?? 0,
                    totalAdmins: data?.totalAdmins ?? 0,
                    totalTrainers: data?.totalTrainers ?? 0,
                    activeTrainers: data?.activeTrainers ?? 0,
                    inactiveTrainers: data?.inactiveTrainers ?? 0,
                });
                setMonthlyRevenue(data?.monthlyRevenue ?? []);
                setMonthlyMembers(data?.monthlyMembers ?? []);
                setMembershipDistribution(data?.membershipDistribution ?? []);
            } else {
                alert.error("Failed to load dashboard data");
            }
        } catch (error) {
            alert.error("Dashboard error");
        } finally {
            rootCtx[0](false);
        }
    };

    // ✅ BACKUP FUNCTION
    const handleBackup = async () => {
        try {
            rootCtx[0](true); 
            const response = await apiRequest.get("dashboard/backup");
            
            if (response.success && response.downloadUrl) {
                const link = document.createElement("a");
                link.href = response.downloadUrl;
                
                // ✅ YAHAN .sql KAR DEIN
                link.setAttribute("download", "Database_Backup.sql"); 
                
                document.body.appendChild(link);
                link.click();
                link.remove();
                alert.success("SQL Backup downloaded successfully!");
            } else {
                alert.error("Failed to generate backup.");
            }
        } catch (error) {
            alert.error("Backup error");
        } finally {
            rootCtx[0](false); 
        }
    };

    /* ================= CHART DATA ================= */

    const revenueData = {
        labels: monthlyRevenue.length ? monthlyRevenue.map(i => i.month) : ["Jan", "Feb", "Mar"],
        datasets: [{
            label: "Revenue (₹)",
            data: monthlyRevenue.length ? monthlyRevenue.map(i => i.total) : [0, 0, 0],
            backgroundColor: "#ff6b2b",
            borderRadius: 6,
            barThickness: 30,
        }],
    };

    // ✅ UPDATED MEMBER GROWTH (GRADIENT + SMOOTH)
    const memberGrowthData = {
        labels: monthlyMembers.length
            ? monthlyMembers.map(i => i.day || i.date || "Day")
            : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

        datasets: [{
            label: "New Members",
            data: monthlyMembers.length
                ? monthlyMembers.map(i => i.count ?? 0)
                : [0, 0, 0, 0, 0, 0, 0],

            borderColor: "#c026d3",
            backgroundColor: "rgba(192,38,211,0.15)",
            tension: 0.4,
            fill: true,

            // 👇 Important to make line visible
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: "#c026d3",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
        }],
    };

    const distributionData = {
        labels: membershipDistribution.length ? membershipDistribution.map(i => i.name) : ["No Data"],
        datasets: [{
            data: membershipDistribution.length ? membershipDistribution.map(i => i.count) : [1],
            backgroundColor: ["#ff6b2b", "#ff4a6e", "#c026d3", "#8b5cf6", "#10b981"],
            borderWidth: 0,
            hoverOffset: 4,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    font: { family: "'Outfit', sans-serif", size: 12 },
                    color: "#9490aa",
                    usePointStyle: true,
                    padding: 20
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { family: "'Outfit', sans-serif" }, color: "#9490aa" }
            },
            y: {
                border: { display: false },
                grid: { color: "#ede9f5", drawBorder: false },
                ticks: { font: { family: "'Outfit', sans-serif" }, color: "#9490aa" }
            }
        }
    };

    // ✅ NEW LINE OPTIONS
    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#1e1b2e",
                titleColor: "#fff",
                bodyColor: "#ddd",
                padding: 10,
                cornerRadius: 6,
                displayColors: false,
            }
        },

        elements: {
            line: {
                borderJoinStyle: "round"
            }
        },

        interaction: {
            intersect: false,
            mode: "index"
        },

        // ✅ ONLY ONE SCALES OBJECT
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: "#9490aa",
                    font: { family: "'Outfit', sans-serif" }
                }
            },
            y: {
                beginAtZero: true,   // ✅ important
                grid: {
                    color: "#f1eef7",
                    drawBorder: false
                },
                ticks: {
                    stepSize: 1,     // ✅ important for visibility
                    color: "#9490aa",
                    font: { family: "'Outfit', sans-serif" }
                }
            }
        }
    };

    const doughnutOptions = {
        ...options,
        scales: { x: { display: false }, y: { display: false } },
        cutout: "70%",
    };

    return (
        <Wrapper>
            {/* ✅ NEW WRAPPER: Taki original Header ka design kharab na ho */}
            <HeaderWrapper>
                <Header>
                    <Title>Business Overview</Title>
                    <PHDivider />
                    <Sub>Membership & revenue insights</Sub>
                </Header>
                
                <BackupButton onClick={handleBackup}>
                    <i className="fa-solid fa-cloud-arrow-down" /> BACK UP
                </BackupButton>
            </HeaderWrapper>

            <Grid>
                <StatCard>
                    <CardLeft>
                        <Label>Today's Revenue</Label>
                        <Value>₹{stats.todaysRevenue.toLocaleString()}</Value>
                    </CardLeft>
                    <IconBox><i className="fa-solid fa-indian-rupee-sign" /></IconBox>
                </StatCard>

                <StatCard>
                    <CardLeft>
                        <Label>Total Revenue</Label>
                        <Value>₹{stats.totalRevenue.toLocaleString()}</Value>
                    </CardLeft>
                    <IconBox><i className="fa-solid fa-vault" /></IconBox>
                </StatCard>

                <StatCard>
                    <CardLeft>
                        <Label>Total Members</Label>
                        <Value>{stats.totalMembers}</Value>
                    </CardLeft>
                    <IconBox><i className="fa-solid fa-users" /></IconBox>
                </StatCard>

                <StatCard $danger>
                    <CardLeft>
                        <Label>Expiring Soon</Label>
                        <Value>{stats.expiringSoon}</Value>
                    </CardLeft>
                    <IconBox $danger><i className="fa-solid fa-bell" /></IconBox>
                </StatCard>
            </Grid>

            <ChartGrid>
                <Card>
                    <CardHeader>
                        <h5>Revenue Analytics</h5>
                        <i className="bi bi-graph-up-arrow"></i>
                    </CardHeader>
                    <ChartWrap><Bar data={revenueData} options={options} /></ChartWrap>
                </Card>

                <Card>
                    <CardHeader>
                        <h5>Plan Distribution</h5>
                        <i className="bi bi-pie-chart"></i>
                    </CardHeader>
                    <ChartWrap><Doughnut data={distributionData} options={doughnutOptions} /></ChartWrap>
                </Card>
            </ChartGrid>

            <ChartGrid>
                <Card>
                    <CardHeader>
                        <h5>Member Growth</h5>
                        <i className="bi bi-activity"></i>
                    </CardHeader>
                    {/* ✅ UPDATED LINE CHART */}
                    <ChartWrap><Line data={memberGrowthData} options={lineOptions} /></ChartWrap>
                </Card>

                <Card>
                    <CardHeader>
                        <h5>Staff Overview</h5>
                        <i className="bi bi-people"></i>
                    </CardHeader>
                    <ListContainer>
                        <ListItem><div className="info"><ListIcon className="bi bi-person-badge" /><span>Total Admins</span></div><b>{stats.totalAdmins}</b></ListItem>
                        <ListItem><div className="info"><ListIcon className="bi bi-person-video" /><span>Total Trainers</span></div><b>{stats.totalTrainers}</b></ListItem>
                        <ListItem $success><div className="info"><ListIcon className="bi bi-check-circle-fill" /><span>Active Trainers</span></div><b>{stats.activeTrainers}</b></ListItem>
                        <ListItem $danger><div className="info"><ListIcon className="bi bi-x-circle-fill" /><span>Inactive Trainers</span></div><b>{stats.inactiveTrainers}</b></ListItem>
                    </ListContainer>
                </Card>
            </ChartGrid>
        </Wrapper>
    );
}

/* ================= STYLES ================= */

// ✅ Naya wrapper jo Header aur Button ko separate karega
const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const BackupButton = styled.button`
  background: var(--grad);
  color: var(--white);
  border: none;
  padding: 8px 16px;
  border-radius: var(--r1);
  font-family: var(--font-ui);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    opacity: 0.95;
  }

  i {
    font-size: 1rem;
  }

  @media(max-width: 600px) {
    width: 100%;
    justify-content: center;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeUp 0.3s ease-in-out;

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 400;
  font-style: italic;
  background: var(--grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: 0.2px;
`;

const PHDivider = styled.span`
  display: inline-block;
  width: 1px; 
  height: 18px; 
  align-self: center;
  background: var(--border2); 
  flex-shrink: 0;
`;

const Sub = styled.p`
  font-family: var(--font-ui);
  font-size: 0.75rem;
  color: var(--tm);
  font-weight: 500;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media(max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media(max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  /* Left accent border */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${({ $danger }) => $danger ? "#f43f5e" : "var(--grad)"};
  }
`;

const CardLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.p`
  font-family: var(--font-ui);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--tm);
  margin: 0;
`;

const Value = styled.h3`
  font-family: var(--font-ui);
  font-size: 1.4rem;
  margin: 0;
  font-weight: 800;
  color: var(--th);
  letter-spacing: -0.5px;
`;

const IconBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--r1);
  background: ${({ $danger }) => $danger ? "#ffe4e6" : "var(--grad-soft)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $danger }) => $danger ? "#f43f5e" : "var(--g1)"};
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;

  @media(max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--border2);

  h5 {
    font-family: var(--font-ui);
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--th);
    margin: 0;
  }

  i {
    color: var(--tm);
    font-size: 1rem;
  }
`;

const ChartWrap = styled.div`
  height: 260px;
  width: 100%;
  position: relative;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  justify-content: center;
`;

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: var(--r1);
  background: var(--bg);
  border: 1px solid var(--border2);
  transition: background 0.2s;

  &:hover {
    background: var(--white);
  }

  .info {
    display: flex;
    align-items: center;
    gap: 10px;

    span {
      font-family: var(--font-ui);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--tb);
    }
  }

  b {
    font-family: var(--font-ui);
    font-size: 1.1rem;
    font-weight: 800;
    color: ${({ $success, $danger }) => $success ? "#10b981" : $danger ? "#f43f5e" : "var(--th)"};
  }
`;

const ListIcon = styled.i`
  font-size: 1rem;
  color: var(--tm);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
`;