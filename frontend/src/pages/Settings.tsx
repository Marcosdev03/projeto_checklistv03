// #region Imports
import { useState, useEffect } from "react";
import styled from "styled-components";
import Layout from "../components/templates/navbar/Layout";
import { Coockie } from "@/utils/API";
import { useNavigate } from "@tanstack/react-router";
// #endregion

// #region Styles
const Container = styled.div`
    max-width: 550px;
    margin: 0 auto;
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

const Section = styled.section`
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border-alt);
    padding: 1.2rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: 0.2s ease;

    &:hover {
        border-color: var(--color-accent);
    }
`;

const SectionTitle = styled.h2`
    margin: 0;
    color: var(--color-text-invert);
    font-size: 1.3rem;
`;

const Row = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Switch = styled.div<{ $active: boolean }>`
    width: 45px;
    height: 22px;
    border-radius: 20px;
    background-color: ${(p) =>
        p.$active ? "var(--color-accent)" : "var(--color-border-alt)"};
    cursor: pointer;
    position: relative;
    transition: 0.2s ease;

    &:hover {
        filter: brightness(1.1);
    }

    &::after {
        content: "";
        position: absolute;
        top: 3px;
        left: ${(p) => (p.$active ? "23px" : "3px")};
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--color-bg-alt-alt);
        transition: 0.2s ease;
    }
`;

const Input = styled.input`
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--color-border-alt);
    background: var(--color-bg-alt-alt);
    color: var(--color-text-invert);
    width: 100%;
`;

const Button = styled.button<{ $danger?: boolean }>`
    padding: 0.6rem;
    border-radius: 6px;
    border: 1px solid var(--color-border-alt);
    background: ${(p) =>
        p.$danger ? "var(--color-danger)" : "var(--color-bg-alt-alt)"};
    color: var(--color-text-invert);
    cursor: pointer;
    font-family: "Delius";
    font-size: 1rem;
    transition: 0.15s ease;

    &:hover {
        filter: brightness(1.07);
    }
`;

// #endregion

// #region Component
export default function SettingsPage() {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    const [username, setUsername] = useState(
        localStorage.getItem("username") || ""
    );

    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const handleNameSave = () => {
        localStorage.setItem("username", username);
    };

    const handleLogout = () => {
        Coockie.removeAccess()
        Coockie.removeRefresh()
        navigate({ to: "/login" })
    };

    return (
        <Layout>
            <Container>

                {/* Tema */}
                <Section>
                    <SectionTitle>Aparência</SectionTitle>

                    <Row>
                        <span style={{ color: "var(--color-text-invert)" }}>
                            Modo Escuro
                        </span>

                        <Switch
                            $active={darkMode}
                            onClick={() => setDarkMode(!darkMode)}
                        />
                    </Row>
                </Section>

                {/* Nome */}
                <Section>
                    <SectionTitle>Perfil</SectionTitle>

                    <label style={{ color: "var(--color-text-invert)" }}>
                        Seu nome
                    </label>

                    <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <Button onClick={handleNameSave}>Salvar Nome</Button>
                </Section>

                {/* Logout */}
                <Section>
                    <SectionTitle>Conta</SectionTitle>

                    <Button $danger onClick={handleLogout}>
                        Deslogar
                    </Button>
                </Section>

            </Container>
        </Layout>
    );
}
// #endregion