import styled from "styled-components";
import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

const Button = styled(Link) <{ $selected: boolean }>`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 5px 10px;
    gap: 4px;

    background-color: transparent;
    border: 2px solid transparent;
    color: var(--color-text-invert);
    text-decoration: ${(props) => (props.$selected ? "underline" : "none")};

    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;

    &:hover {
        border-color: var(--color-accent-hover);
    }

    &:focus {
        border-color: transparent;
    }

    &:active {
        border-color: transparent;
    }

    @media (max-width: 1300px) {
        &:hover {
            border-color: transparent;
        }
    }
`;

type ButtonNavbarProps = {
    children?: ReactNode;
    icon?: ReactNode;
    selected?: boolean;
    to?: string;
};

export default function ButtonNavbar({ children, icon, to = '/', selected = false }: ButtonNavbarProps) {
    return (
        <Button $selected={selected} to={to}>
            {icon}<span>{children}</span>
        </Button>
    );
}