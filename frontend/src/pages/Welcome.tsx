// #region Imports
import { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Input from '../components/atoms/login/Login-Text-Field';
import Button from '../components/atoms/buttons/Button-Confirm';
import { useNavigate } from '@tanstack/react-router';
import API, { ENDPOINT } from '../utils/API';
// #endregion
// #region Animações
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const shakeAnim = keyframes`
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(4px); }
  30%, 50%, 70% { transform: translateX(-8px); }
  40%, 60% { transform: translateX(8px); }
`;
// #endregion
// #region Estilos
const Container = styled.main<{ $fade?: 'in' | 'out' }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    color: var(--color-text-invert);
    background-color: var(--color-bg-alt);
    animation: ${({ $fade }) =>
        $fade === 'out'
            ? css`${fadeOut} 0.5s`
            : css`${fadeIn} 0.5s`};
`;

const Box = styled.div<{ $fade?: 'in' | 'out'; $shake?: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 20px;
    font-size: 30px;
    border-radius: 5px;
    border: 1px solid var(--color-border-alt);
    background-color: var(--color-bg-alt-alt);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    user-select: none;
    ${({ $fade, $shake }) => {
        if ($shake) {
            return css`animation: ${shakeAnim} 0.5s;`;
        }
        if ($fade === 'in') {
            return css`animation: ${fadeIn} 0.5s;`;
        }
        if ($fade === 'out') {
            return css`animation: ${fadeOut} 0.5s;`;
        }
        return '';
    }}

    @media (max-width: 1300px) {
        font-size: 24px;
        width: 90%;
    }
`;
// #endregion
// #region Componente
export default () => {
    const [nameChanged, setNameChanged] = useState(false);
    const [name, setName] = useState('');
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [shakeError, setShakeError] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const navigate = useNavigate();
    const [containerFade, setContainerFade] = useState<'in' | 'out'>('in');
    const [isNavigating, setIsNavigating] = useState(false);

    // Determina o estado do fade para o Box
    const getFade = () => {
        if (shakeError) return undefined;
        if (isFadingOut) return 'out';
        if (!hasMounted) return 'in';
        return undefined;
    };

    // Marca que o componente foi montado para controlar a animação de entrada
    if (!hasMounted) setHasMounted(true);

    // Função para lidar com erros e ativar a animação de shake
    const handleError = () => {
        setShakeError(true);
        setTimeout(() => setShakeError(false), 400);
    };

    // Função para lidar com o clique do botão de confirmação
    const handleButton = async () => {
        try {
            const res = await API.PATCH(ENDPOINT.CHANGE_USERNAME, { username: name });
            if (res.status >= 200 && res.status <= 299) {
                setIsFadingOut(true);
                const time = setTimeout(() => {
                    setNameChanged(true);
                    setIsFadingOut(false);
                }, 500);
                return () => clearTimeout(time);
            }
        } catch {
            handleError();
        }
    };

    // Função para navegar para a página inicial com animação de fade out
    const handleNavigate = () => {
        setContainerFade('out');
        setIsNavigating(true);
        sessionStorage.removeItem("noNameChanged")
        localStorage.setItem("username", name);
        setTimeout(() => {
            navigate({ to: '/' });
        }, 500);
    }

    return (
        <Container $fade={containerFade}>
            {!isNavigating && !nameChanged && (
                <Box
                    $fade={getFade()}
                    $shake={shakeError}
                >
                    <p>Como podemos te chamar?</p>
                    <Input type="text" placeholder="Digite seu nome" value={name} action={setName} />
                    <Button type="button" label='Confirmar' action={handleButton} />
                </Box>
            )}
            {!isNavigating && nameChanged && !isFadingOut && (
                <Box $fade="in">
                    <p>Bem-vindo, {name}!</p>
                    <Button type="button" label='Continuar' action={handleNavigate} />
                </Box>
            )}
        </Container>
    );
}
// #endregion