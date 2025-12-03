import React, { useLayoutEffect, useRef } from "react";
import styled from "styled-components";

type Variant = "mobile" | "desktop";
interface AnimatedFrameProps {
    radius?: number;
    speed?: number;
    width?: string;
    height?: string;
    variant?: Variant;
    children?: React.ReactNode;
}

const Frame = styled.div<{ $width?: string; $height?: string; $variant?: Variant }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: ${({ $width }) => $width ?? "100%"};
    height: ${({ $height }) => $height ?? "100%"};
    color: var(--color-text);
    padding: 0px 20px;
    background-image:
        radial-gradient(360px 360px at var(--ax, 50%) var(--ay, 50%), var(--color-accent), transparent 100%),
        radial-gradient(360px 360px at var(--bx, 50%) var(--by, 50%), var(--color-accent), transparent 100%);
    gap: 20px;
    text-align: center;
    font-family: "Delius", cursive;

    h1 {
        font-size: ${({ $variant }) => $variant === "desktop" ? "60px" : "30px"};
        font-weight: normal;
        user-select: none;
    }

    p {
        font-size: 20px;
        user-select: none;
    }
`;

export default function AnimatedFrame({
    radius = 60,
    speed = 0.5,
    width,
    height,
    variant = "desktop",
    children,
}: AnimatedFrameProps) {

    const frameRef = useRef<HTMLDivElement | null>(null);
    const angleRef = useRef(0);
    const lastTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const deg = Math.PI / 180;

    useLayoutEffect(() => {
        const loop = (time: number) => {
            if (lastTimeRef.current === null) lastTimeRef.current = time;
            const delta = (time - lastTimeRef.current) / 1000;
            lastTimeRef.current = time;

            angleRef.current = (angleRef.current + speed * 60 * delta) % 360;

            const velocidadeAngular = angleRef.current;

            const ax = Number((50 + Math.cos(velocidadeAngular * deg) * radius).toFixed(2));
            const ay = Number((50 + Math.sin(velocidadeAngular * deg) * radius).toFixed(2));
            const bx = Number((50 + Math.cos((velocidadeAngular + 180) * deg) * radius).toFixed(2));
            const by = Number((50 + Math.sin((velocidadeAngular + 180) * deg) * radius).toFixed(2));

            if (frameRef.current) {
                frameRef.current.style.setProperty("--ax", `${ax}%`);
                frameRef.current.style.setProperty("--ay", `${ay}%`);
                frameRef.current.style.setProperty("--bx", `${bx}%`);
                frameRef.current.style.setProperty("--by", `${by}%`);
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            lastTimeRef.current = null;
        };
    });

    return (
        <Frame ref={frameRef} $width={width} $height={height} $variant={variant}>
            {children}
        </Frame>
    );
}