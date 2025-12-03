// #region Imports
import styled from "styled-components";
import { Link } from "@tanstack/react-router";
// #endregion
// #region Estilos
const Container = styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-alt);
    text-align: center;
    padding: 20px;
    user-select: none;
`;

const Title = styled.h1`
    font-size: 6rem;
    margin-bottom: 10px;
    color: var(--color-accent);
`;

const Subtitle = styled.p`
    font-size: 1.5rem;
    color: var(--color-text-invert);
`;

const Button = styled(Link)`
    margin-top: 30px;
    padding: 12px 22px;
    background: var(--color-accent);
    color: var(--color-text);
    border-radius: 8px;
    box-shadow: var(--shadow-md);
    text-decoration: none;
    transition: 0.2s ease;

    &:hover {
        background: var(--color-accent-hover);
    }
`;
// #endregion
// #region Component
export default function NotFound() {
    return (
        <Container>
            <Title>404</Title>
            <Subtitle>Página não encontrada</Subtitle>
            <Button to="/">Voltar para Home</Button>
        </Container>
    );
}
// #endregion