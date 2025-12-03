import styled from "styled-components";

const InputContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: auto;
    gap: 3px;
    padding: 10px 0px;
`;

const Placeholder = styled.label`
    font-size: 13px;
    color: var(--color-text-invert);
    font-weight: 600;
    letter-spacing: 0.2px;
    user-select: none;
`;

const InputField = styled.input`
    width: 100%;
    height: 44px;
    padding: 10px 14px;
    font-size: 15px;
    color: var(--color-text-invert);
    border-radius: 5px;
    box-shadow: 3px 3px rgba(0, 0, 0, 0.1);
    background-color: var(--color-bg-alt-alt);
    border: 1px solid var(--color-border-alt);
    outline: none;

    &:focus {
        border-color: var(--color-accent);
    }
`

type Input = {
    placeholder?: string;
    type: "text" | "password" | "email" | "number";
    value: string;
    action: (value: string) => void;
}

export default ({ type, placeholder, value, action }: Input) => {
    return (
        <InputContainer>
            <Placeholder htmlFor={`InputField-${placeholder}`} >{placeholder}</Placeholder>
            <InputField
                id={`InputField-${placeholder}`}
                type={type}
                value={value}
                onChange={(e) => action(e.target.value)}
            />
        </InputContainer>
    )
}