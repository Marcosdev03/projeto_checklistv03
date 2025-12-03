//#region Imports
import { useEffect, useState } from "react";
import styled from "styled-components";
import API, { ENDPOINT } from "../utils/API";
import Layout from "../components/templates/navbar/Layout";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";
//#endregion
//#region Styles
const DashboardWrapper = styled.div`
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
`;

const Card = styled.div`
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border-alt);
  padding: 1.2rem;
  border-radius: 6px;
  font-family: "Delius";
`;

const CardLabel = styled.span`
  font-size: 0.9rem;
  color: var(--color-text-invert-alt);
`;

const CardValue = styled.h2`
  font-size: 2rem;
  margin: 0;
  color: var(--color-text-invert);
`;

const Section = styled.div`
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border-alt);
  padding: 1.5rem;
  border-radius: 6px;
  font-family: "Delius";
`;

const SectionTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  color: var(--color-text-invert);
`;

/* Skeleton */

const Skeleton = styled.div`
  height: 120px;
  background: var(--color-bg-alt-alt);
  border-radius: 6px;
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% { opacity: .5; }
    50% { opacity: .2; }
    100% { opacity: .5; }
  }
`;

/* Types */

type DashboardData = {
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    progress: number;
    weekActivity: Array<{
        day: string;
        value: number;
    }>;
};
//#endregion
//#region Component
export default () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const response = await API.GET(ENDPOINT.DASHBOARD);
            setData(response.data);
        } catch (err) {
            console.error("Erro ao buscar dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading || !data) {
        return (
            <Layout>
                <DashboardWrapper>
                    <CardsGrid>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                    </CardsGrid>
                    <Section><Skeleton /></Section>
                    <Section><Skeleton /></Section>
                </DashboardWrapper>
            </Layout>
        );
    }

    return (
        <Layout>
            <DashboardWrapper>

                {/* CARDS */}
                <CardsGrid>
                    <Card>
                        <CardLabel>Total de Tarefas</CardLabel>
                        <CardValue>{data.totalTasks}</CardValue>
                    </Card>

                    <Card>
                        <CardLabel>Tarefas Pendentes</CardLabel>
                        <CardValue>{data.pendingTasks}</CardValue>
                    </Card>

                    <Card>
                        <CardLabel>Tarefas Concluídas</CardLabel>
                        <CardValue>{data.completedTasks}</CardValue>
                    </Card>
                </CardsGrid>

                {/* PROGRESSO */}
                <Section>
                    <SectionTitle>Progresso Geral</SectionTitle>

                    <div style={{ width: "100%", height: 240 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: "Concluídas", value: data.progress },
                                        { name: "Pendentes", value: 100 - data.progress }
                                    ]}
                                    dataKey="value"
                                    innerRadius={65}
                                    outerRadius={90}
                                    stroke="none"
                                >
                                    <Cell fill="var(--color-accent)" />
                                    <Cell fill="var(--color-border-alt-alt)" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <h2 style={{
                        textAlign: "center",
                        marginTop: "-135px",
                        fontSize: "2rem",
                        color: "var(--color-text-invert)"
                    }}>
                        {data.progress}%
                    </h2>

                </Section>

                {/* WEEK ACTIVITY */}
                <Section>
                    <SectionTitle>Atividade da Semana</SectionTitle>

                    <div style={{ width: "100%", height: 280 }}>
                        <ResponsiveContainer>
                            <BarChart data={data.weekActivity}>
                                <XAxis dataKey="day" stroke="var(--color-text-invert-alt)" />
                                <YAxis stroke="var(--color-text-invert-alt)" />
                                <Tooltip />
                                <Bar dataKey="value" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </Section>

            </DashboardWrapper>
        </Layout>
    );
}
//#endregion