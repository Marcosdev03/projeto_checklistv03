import { type ReactNode } from "react";
import styled from "styled-components";
import Navbar from "@/components/organisms/navbar/Double-Navbar";

const Container = styled.main`
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    width: 100%;
    height: 100%;
    color: var(--color-text-invert);
    background-color: var(--color-bg-alt);
`;

const Scroll = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    width: 100%;
    height: 100%;
    overflow-y: auto;
`;

const Main = styled.main`
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    color: var(--color-text-invert);
    background-color: var(--color-bg-alt);
    padding: 20px;
    gap: 20px;
    width: 60%;
    height: auto;
    @media (max-width: 1300px) {
        width: 80%;
    }
    @media (max-width: 800px) {
        width: 100%;
    }
`;

type NavbarLayout = {
    children: ReactNode;
}

export default ({ children }: NavbarLayout) => {
    return (
        <Container>
            <Navbar />
            <Scroll>
                <Main>
                    {children}
                </Main>
            </Scroll>
        </Container>
    )
}