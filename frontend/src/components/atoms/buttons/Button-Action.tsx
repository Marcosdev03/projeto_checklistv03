import styled from "styled-components";

const ActionButton = styled.button<{ $delete?: boolean }>`
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    border: 1px solid var(--color-border-alt);
    cursor: pointer;
    font-family: "Delius";
    transition: 0.15s ease;
    font-size: 0.9rem;
    background-color: ${(p) =>
        p.$delete ? "var(--color-danger)" : "var(--color-bg-alt-alt)"};
    color: var(--color-text-invert);

    &:hover:not(:disabled) {
        filter: brightness(1.08);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

type ButtonAction = {
    children: React.ReactNode;
    onClick: () => void;
    delete?: boolean;
    disabled?: boolean;
}

export default ({ children, onClick, delete: del, disabled }: ButtonAction) => {
    return (
        <ActionButton onClick={onClick} $delete={del} disabled={disabled}>
            {children}
        </ActionButton>
    )
}