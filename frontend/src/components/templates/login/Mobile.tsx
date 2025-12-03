import { useRef, useState, useEffect } from "react";
import { ArrowDown } from "lucide-react"
import AnimatedBackground from "../../atoms/login/Animated-Background";
import LoginCard from "../../organisms/login/AuthCard";
import styled from "styled-components";

// #region Styles
const Home = styled.main`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: auto;
`;

const Button = styled(ArrowDown) <{ $show: boolean }>`
    position: absolute;
    bottom: 40px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px solid var(--color-border-alt);
    display: ${props => props.$show ? 'flex' : 'none'};
    transition: background 0.2s;
    animation: bounce 1.2s infinite;

    @keyframes bounce {
        0%, 100% { bottom: 40px; }
        50% { bottom: 70px; }
    }
`;

const FrameLogin = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: auto;
    background-color: var(--color-bg-alt);
    color: var(--color-text-invert);
`;
// #endregion

// #region Componente
export default () => {
    const loginRef = useRef<HTMLDivElement>(null);
    const [buttonVisible, setButtonVisible] = useState(true);

    const scrollToLogin = () => {
        loginRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const root = document.querySelector("#root");
        const handleScroll = (e: any) => {
            if (e.target.scrollTop > e.target.clientHeight / 4) {
                setButtonVisible(false);
            } else {
                setButtonVisible(true);
            }
        };
        root?.addEventListener("scroll", handleScroll);
        return () => root?.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <Home>
            <AnimatedBackground radius={80} height={"100dvh"} variant="mobile">
                <h1>Organize o seu dia!</h1>
                <p>Concentre-se no que realmente importa e alcance suas metas com mais clareza.</p>
                <Button onClick={scrollToLogin} $show={buttonVisible} />
            </AnimatedBackground>
            <FrameLogin ref={loginRef}>
                <LoginCard />
            </FrameLogin>
        </Home>
    );
}
// #endregion