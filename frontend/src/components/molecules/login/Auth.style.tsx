import styled from "styled-components";

export const CardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 500px;
    height: 500px;
    border-radius: 5px;
    border: 1px solid var(--color-border-alt);
    background-color: var(--color-bg-alt-alt);
    padding: 30px 0px;
    user-select: none;

    @media (max-width: 1300px) {
        width: 100%;
    }
`;

export const Title = styled.h1`
    width: 95%;
    height: 40px;
    text-align: center;
    text-decoration: underline;
`

export const Subtitle = styled.p<{ $isError: boolean }>`
    width: 95%;
    height: 0px;
    position: relative;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${props => props.$isError ? 'var(--color-error)' : 'var(--color-success)'};
    font-size: 20px;
    @media (max-width: 600px) {
        font-size: 16px;
    }
`;

export const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 70%;
    height: 200px;
`;

export const CodeWrap = styled.div<{ $show: boolean }>`
    visibility: ${props => props.$show ? "visible" : "hidden"};
    opacity: ${props => props.$show ? 1 : 0};
    pointer-events: ${props => props.$show ? "auto" : "none"};
    transition: opacity .2s ease;
    width: 100%;
`;

export const ButtonGroup = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 70%;
    height: auto;
`;

export const RowGroup = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 10px;
    padding-bottom: 20px;
`;

export const TextAchor = styled.a`
    color: var(--color-accent);
    font-size: 20px;
    user-select: none;
    &:hover {
        cursor: pointer;
        color: var(--color-accent-hover);
    }
    @media (max-width: 600px) {
        font-size: 16px;
    }
`;