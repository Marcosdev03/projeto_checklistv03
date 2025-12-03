import styled from 'styled-components';
import { Check } from "lucide-react";
import GetName from '../../atoms/navbar/Name-Label';

const TopBar = styled.main`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 60px;
    font-size: 24px;
    padding: 0 20px;
    background-color: var(--color-bg-alt-alt-alt);

    @media (max-width: 400px) {
        padding: 0 10px;
    }

    border-bottom: 1px solid var(--color-border-alt);
`

const Main = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    div {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;

        h1 {
            font-size: 24px;
        }
    }

    width: 60%;
    @media (max-width: 1300px) {
        width: 80%;
    }
    @media (max-width: 800px) {
        width: 100%;
    }
    @media (max-width: 600px) {
        align-items: center;
        text-align: center;
        flex-direction: column;

        div {
            margin-left: -32px;
        }
    }
`

export default () => {
    return (
        <TopBar>
            <Main>
                <div>
                    <Check size={32} color={"var(--color-accent)"} />
                    <p>CheckList</p>
                </div>
                <GetName />
            </Main>
        </TopBar>
    )
}