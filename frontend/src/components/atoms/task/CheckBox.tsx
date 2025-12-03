import styled from "styled-components";

const CheckWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-right: 1rem;
    cursor: pointer;
    flex-shrink: 0;
`;

const Checkbox = styled.div<{ $checked: boolean }>`
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 2px solid var(--color-border-alt);
    background-color: ${(p) => p.$checked ? "var(--color-accent)" : "transparent"};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s ease;

    &:hover {
      filter: brightness(1.15);
    }
`;

const CheckMark = styled.span`
  color: white;
  font-size: 14px;
  font-weight: bold;
`;

type CheckBox = {
    completed: boolean;
    onToggle: () => void;
}

export default ({ completed, onToggle }: CheckBox) => {
    return (
        <CheckWrapper onClick={onToggle}>
            <Checkbox $checked={completed}>
                {completed ? <CheckMark>✓</CheckMark> : null}
            </Checkbox>
        </CheckWrapper>
    )
}