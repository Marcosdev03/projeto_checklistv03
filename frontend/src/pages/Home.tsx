//#region Imports
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
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


//#region Animations
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

//#endregion


//#region Styles

const DashboardWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  animation: ${fadeUp} 0.4s ease both;
`;

/* ── Cards ────────────────────────────────────────────── */

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ accentColor: string }>`
  background: linear-gradient(145deg, var(--color-bg-alt-alt) 0%, var(--color-bg-alt) 100%);
  border: 1px solid var(--color-border-alt);
  border-top: 2px solid ${({ accentColor }) => accentColor};
  padding: 1.3rem 1.4rem 1.1rem;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  cursor: default;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 32px rgba(0, 0, 0, 0.55),
                0 0 0 1px ${({ accentColor }) => accentColor}33;
  }
`;

const CardAccentDot = styled.span<{ color: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
  margin-bottom: 0.6rem;
  box-shadow: 0 0 8px ${({ color }) => color}88;
`;

const CardLabel = styled.span`
  display: block;
  font-size: 0.72rem;
  color: var(--color-text-invert-alt);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.3rem;
`;

const CardValue = styled.h2`
  font-size: 2.4rem;
  margin: 0;
  color: var(--color-text-invert);
  line-height: 1;
  letter-spacing: -0.02em;
`;

/* ── Progress ─────────────────────────────────────────── */

const ProgressSection = styled.div`
  background: linear-gradient(145deg, var(--color-bg-alt-alt) 0%, var(--color-bg-alt) 100%);
  border: 1px solid var(--color-border-alt);
  padding: 1.1rem 1.4rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressLabel = styled.span`
  font-size: 0.78rem;
  color: var(--color-text-invert-alt);
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const ProgressValue = styled.span`
  font-size: 0.85rem;
  color: var(--color-accent);
  font-weight: bold;
  letter-spacing: 0.02em;
`;

const ProgressBarTrack = styled.div`
  width: 100%;
  height: 6px;
  background: var(--color-border-alt-alt);
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${({ progress }) => progress}%;
  background: linear-gradient(90deg, var(--color-accent) 0%, #a855f7 100%);
  border-radius: 999px;
  box-shadow: 0 0 10px var(--color-accent-glow);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
`;

/* ── Charts ───────────────────────────────────────────── */

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: linear-gradient(145deg, var(--color-bg-alt-alt) 0%, var(--color-bg-alt) 100%);
  border: 1px solid var(--color-border-alt);
  padding: 1.3rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 0.7rem;
  color: var(--color-text-invert-alt);
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const PieWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 175px;
`;

const PieCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
`;

const PieCenterValue = styled.span`
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--color-text-invert);
  font-family: "Delius";
  display: block;
  line-height: 1;
`;

const PieCenterLabel = styled.span`
  font-size: 0.65rem;
  color: var(--color-text-invert-alt);
  font-family: "Delius";
  display: block;
  margin-top: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

/* ── Tooltip ──────────────────────────────────────────── */

const TooltipBox = styled.div`
  background: var(--color-bg-alt-alt-alt);
  border: 1px solid var(--color-border-alt);
  border-radius: 8px;
  padding: 0.55rem 0.85rem;
  font-family: "Delius";
  font-size: 0.8rem;
  color: var(--color-text-invert);
  box-shadow: var(--shadow-md);
`;

const TooltipLabel = styled.p`
  color: var(--color-text-invert-alt);
  font-size: 0.7rem;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const TooltipValue = styled.p`
  color: var(--color-accent);
  font-size: 1rem;
  font-weight: bold;
`;

/* ── Skeleton ─────────────────────────────────────────── */

const pulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 0.18; }
`;

const Skeleton = styled.div`
  height: 110px;
  background: var(--color-bg-alt-alt);
  border-radius: 12px;
  animation: ${pulse} 1.6s ease-in-out infinite;
`;

/* ── Types ────────────────────────────────────────────── */

type DashboardData = {
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    progress: number;
    weekActivity: Array<{ day: string; value: number }>;
};

type DashboardResponse = {
    total: number;
    pendentes: number;
    feitas: number;
    percentual: number;
    atividade_semana: Record<string, number>;
};
//#endregion


//#region Custom Tooltip
type CustomTooltipProps = {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;
    return (
        <TooltipBox>
            <TooltipLabel>{label}</TooltipLabel>
            <TooltipValue>{payload[0].value} tarefa{(payload[0].value ?? 0) !== 1 ? "s" : ""}</TooltipValue>
        </TooltipBox>
    );
};
//#endregion


//#region Component
export default () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await API.GET(ENDPOINT.DASHBOARD);
            const raw: DashboardResponse = response.data;
            setData({
                totalTasks: raw.total,
                pendingTasks: raw.pendentes,
                completedTasks: raw.feitas,
                progress: raw.percentual,
                weekActivity: Object.entries(raw.atividade_semana).map(([day, value]) => ({ day, value })),
            });
        } catch (err) {
            console.error("Erro ao buscar dashboard:", err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();

        const handleVisibility = () => {
            if (!document.hidden) fetchDashboard(true);
        };

        document.addEventListener("visibilitychange", handleVisibility);
        const interval = setInterval(() => fetchDashboard(true), 30_000);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            clearInterval(interval);
        };
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
                    <Skeleton style={{ height: "46px" }} />
                    <ChartsGrid>
                        <Section><Skeleton /></Section>
                        <Section><Skeleton /></Section>
                    </ChartsGrid>
                </DashboardWrapper>
            </Layout>
        );
    }

    const pieData = [
        { name: "Concluídas", value: data.progress },
        { name: "Pendentes",  value: 100 - data.progress }
    ];

    return (
        <Layout>
            <DashboardWrapper>

                {/* CARDS */}
                <CardsGrid>
                    <Card accentColor="var(--color-accent)">
                        <CardAccentDot color="var(--color-accent)" />
                        <CardLabel>Total</CardLabel>
                        <CardValue>{data.totalTasks}</CardValue>
                    </Card>

                    <Card accentColor="var(--color-warning)">
                        <CardAccentDot color="var(--color-warning)" />
                        <CardLabel>Pendentes</CardLabel>
                        <CardValue>{data.pendingTasks}</CardValue>
                    </Card>

                    <Card accentColor="var(--color-success)">
                        <CardAccentDot color="var(--color-success)" />
                        <CardLabel>Concluídas</CardLabel>
                        <CardValue>{data.completedTasks}</CardValue>
                    </Card>
                </CardsGrid>

                {/* BARRA DE PROGRESSO */}
                <ProgressSection>
                    <ProgressHeader>
                        <ProgressLabel>Progresso Geral</ProgressLabel>
                        <ProgressValue>{data.progress}%</ProgressValue>
                    </ProgressHeader>
                    <ProgressBarTrack>
                        <ProgressBarFill progress={data.progress} />
                    </ProgressBarTrack>
                </ProgressSection>

                {/* GRÁFICOS */}
                <ChartsGrid>

                    {/* DONUT */}
                    <Section>
                        <SectionTitle>Conclusão</SectionTitle>
                        <PieWrapper>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <defs>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        innerRadius={62}
                                        outerRadius={76}
                                        stroke="none"
                                        startAngle={90}
                                        endAngle={-270}
                                        isAnimationActive
                                        animationDuration={900}
                                        animationEasing="ease-out"
                                    >
                                        <Cell fill="var(--color-accent)" filter="url(#glow)" />
                                        <Cell fill="var(--color-border-alt-alt)" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <PieCenter>
                                <PieCenterValue>{data.progress}%</PieCenterValue>
                                <PieCenterLabel>concluído</PieCenterLabel>
                            </PieCenter>
                        </PieWrapper>
                    </Section>

                    {/* BARRAS */}
                    <Section>
                        <SectionTitle>Atividade da Semana</SectionTitle>
                        <div style={{ width: "100%", height: 200 }}>
                            <ResponsiveContainer>
                                <BarChart
                                    data={data.weekActivity}
                                    barSize={20}
                                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%"   stopColor="#a855f7" stopOpacity={1} />
                                            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.5} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="day"
                                        stroke="var(--color-text-invert-alt)"
                                        tick={{ fontSize: 11, fontFamily: "Delius", fill: "var(--color-text-invert-alt)" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--color-text-invert-alt)"
                                        tick={{ fontSize: 11, fontFamily: "Delius", fill: "var(--color-text-invert-alt)" }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="url(#barGrad)"
                                        radius={[6, 6, 2, 2]}
                                        isAnimationActive
                                        animationDuration={800}
                                        animationEasing="ease-out"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Section>

                </ChartsGrid>

            </DashboardWrapper>
        </Layout>
    );
}
//#endregion
