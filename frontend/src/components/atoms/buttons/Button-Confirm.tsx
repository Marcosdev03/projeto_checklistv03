import styled from "styled-components";

const Button = styled.button`
    width: 100%;
    height: 100%;
    min-height: 44px;
    padding: 10px 14px;
    font-size: 15px;
    color: var(--color-text);
    background-color: var(--color-accent);
    border: none;
    outline: none;
    border-radius: 5px;
    transition: ease-in-out 100ms;
    font-family: "Delius", cursive;
    box-shadow: 3px 3px rgba(0, 0, 0, 0.5);

    &:hover {
        cursor: pointer;
        background-color: var(--color-accent-hover);
    }

    &:disabled {
        opacity: 0.6;
        cursor: default;
        transform: none;
        box-shadow: none;
    }
`

type ButtonConfirm = {
    action: () => void;
    type?: "button" | "submit" | "reset";
    label?: string;
    disabled?: boolean;
}

export default ({ action, type, label, disabled }: ButtonConfirm) => {
    return (
        <Button type={type} onClick={(e) => { e.preventDefault(); action(); }} disabled={disabled}>
            {label}
        </Button>
    )
}