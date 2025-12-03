// Imports de estilos
import { CardContainer, Title, Subtitle, InputGroup, ButtonGroup, RowGroup, TextAchor, CodeWrap } from "./Auth.style";
import Button from "../../atoms/buttons/Button-Confirm";
import Input from "../../atoms/login/Login-Text-Field";

// Imports React e API
import API, { ENDPOINT } from "../../../utils/API";
import { useState, useEffect } from "react";

type Recover = {
    warn: string;
    error: string;
    cardType: "recover" | "switch_password";
    setError: (message: string) => void;
    setWarn: (message: string) => void;
    redirectCard: (type: "login" | "register" | "recover" | "switch_password") => void;
}

export default ({ cardType, error, warn, redirectCard, setWarn, setError }: Recover) => {

    // #region States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [recoverButtonDisabled, setRecoverButtonDisabled] = useState(true);
    const [showCodeInput, setShowCodeInput] = useState(false);
    // #endregion

    // #region Funções
    // =============================================================================
    // Função para enviar o código de recuperação para o email fornecido
    // e habilitar o campo de entrada do código após 6 segundos
    // =============================================================================
    const handleCode = async () => {
        try {
            setIsLoading(true);
            const res = await API.POST(ENDPOINT.AUTH_RECOVER, { email });
            if (res.status >= 200 && res.status <= 299) {
                setWarn("Um código de recuperação foi enviado para o seu email.");
                const codeInputInterval = setTimeout(() => {
                    setShowCodeInput(true);
                }, 6000);
                return () => clearInterval(codeInputInterval);
            } else {
                setError("Email não cadastrado.");
            }
        } catch {
            setError("Email não cadastrado.");
        } finally {
            setIsLoading(false);
        }
    }

    // =============================================================================
    // Função para verificar o código de recuperação e redirecionar para a troca de senha
    // ou exibir um erro se o código for inválido
    // =============================================================================
    const handleRecover = async () => {
        try {
            setIsLoading(true);
            const res = await API.POST(ENDPOINT.AUTH_RECOVER_COMFIRM, { email, code });
            if (res.status === 200) {
                redirectCard("switch_password");
            } else {
                setError("Código inválido.");
            }
        } catch {
            setError("Código inválido.");
        } finally {
            setIsLoading(false);
        }
    }

    // =============================================================================
    // Função para alterar a senha usando o código de recuperação
    // e redirecionar para o login ou exibir um erro se falhar
    // =============================================================================
    const handleSwitchToPassword = async () => {
        if (password !== passwordConfirm) {
            setError("As senhas não coincidem.");
            return;
        }
        try {
            setIsLoading(true);
            const res = await API.PUT(ENDPOINT.AUTH_RECOVER_COMFIRM, { email, code, password });
            if (res.status === 200) {
                redirectCard("login");
            } else {
                setError("Erro ao alterar a senha.");
            }
        } catch {
            setError("Erro ao alterar a senha.");
        } finally {
            setIsLoading(false);
        }
    }
    // #endregion

    // #region useEffects
    // =============================================================================
    // useEffect para monitorar o email e enviar o código de recuperação automaticamente
    // quando o email for válido e o CardType for "recover", após 2 segundos de digitação.
    // ===============================================================================
    useEffect(() => {
        if (cardType !== "recover") return;

        if (email.length > 8 && email.includes("@")) {

            const codeReqInterval = setTimeout(() => {
                handleCode();
            }, 2000);

            return () => clearInterval(codeReqInterval);
        } else {
            setShowCodeInput(false);
        }

    }, [email]);

    // =============================================================================
    // useEffect para monitorar o código de recuperação e habilitar o botão de recuperação
    // quando o código tiver 6 ou mais caracteres e o CardType for "recover".
    // ===============================================================================
    useEffect(() => {
        if (cardType !== "recover") return;
        if (code.length >= 6) return setRecoverButtonDisabled(false);
        setRecoverButtonDisabled(true);
    }, [code]);
    // #endregion

    if (cardType == "recover") {
        return (
            <CardContainer>
                <Title>Recuperação de senha</Title>
                <Subtitle $isError={error ? true : false}>{warn}</Subtitle>
                <InputGroup>
                    <Input type="email" placeholder="Email" value={email} action={setEmail} />
                    <CodeWrap $show={showCodeInput}>
                        <Input type="text" placeholder="Código" value={code} action={setCode} />
                    </CodeWrap>
                </InputGroup>
                <ButtonGroup>
                    <RowGroup>
                        <TextAchor onClick={() => { setPassword(""); setPasswordConfirm(""); redirectCard("login") }}>Voltar ao login</TextAchor>
                    </RowGroup>
                    <Button label="Enviar" action={handleRecover} disabled={(recoverButtonDisabled) || (isLoading)} />
                </ButtonGroup>
            </CardContainer>
        )
    }

    if (cardType == "switch_password") {
        return (
            <CardContainer>
                <Title>Nova senha</Title>
                <Subtitle $isError={error ? true : false}>{warn}</Subtitle>
                <InputGroup>
                    <Input type="password" placeholder="Senha" value={password} action={setPassword} />
                    <Input type="password" placeholder="Confirmar senha" value={passwordConfirm} action={setPasswordConfirm} />
                </InputGroup>
                <ButtonGroup>
                    <RowGroup />
                    <Button label="Confirmar" action={handleSwitchToPassword} disabled={(recoverButtonDisabled) || (isLoading)} />
                </ButtonGroup>
            </CardContainer>
        )
    }
}