import AnimatedBackground from "../../atoms/login/Animated-Background";
import LoginCard from "../../organisms/login/AuthCard";
import styled from "styled-components";

// #region Styles
const Home = styled.main`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
`;

const FrameLogin = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 40%;

    background-color: var(--color-bg-alt);
    color: var(--color-text-invert);
`;
// #endregion

// #region Componente
export default () => {
    return (
        <Home>
            <AnimatedBackground radius={60} width={"60%"} height={"100%"} variant="desktop">
                <h1>Organize o seu dia!</h1>
                <p>Concentre-se no que realmente importa e alcance suas metas com mais clareza.</p>
            </AnimatedBackground>
            <FrameLogin>
                <LoginCard />
            </FrameLogin>
        </Home>
    );
}
// #endregion