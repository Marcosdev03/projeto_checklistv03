import TopBar from "../../molecules/navbar/TopBar"
import BottomBar from "../../molecules/navbar/BottomBar"
import styled from "styled-components";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    user-select: none;
`

export default () => {
    return (
        <Container>
            <TopBar />
            <BottomBar />
        </Container>
    )
}