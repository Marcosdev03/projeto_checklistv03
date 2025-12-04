// Imports de estilos
import { CardContainer, Title, Subtitle, InputGroup, ButtonGroup, RowGroup, TextAchor, CodeWrap } from "./Auth.style";
import Button from "../../atoms/buttons/Button-Confirm";
import Input from "../../atoms/login/Login-Text-Field";

// Imports React e API
import API, { ENDPOINT } from "../../../utils/API";
import { useState, useEffect } from "react";

type Register = {
    warn: string;
    error: string;
    setError: (message: string) => void;
    setWarn: (message: string) => void;
    handleSwitchTypeCard: () => void;
    redirectCard: (type: "login" | "register" | "recover" | "switch_password") => void;
}

export default ({ error, handleSwitchTypeCard, redirectCard, setError, warn, setWarn }: Register) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [ButtonDisabled, setButtonDisabled] = useState(true);

    const [showCodeInput, setShowCodeInput] = useState(false);
    const [code, setCode] = useState("");
    const [temp_token, setTempCode] = useState("");

    const [pass, setPass] = useState(false);

    const handleSend = async () => {
        try {
            setIsLoading(true);
            const res = await API.POST(ENDPOINT.AUTH_REGISTER_CODE_SEND, { email });
            console.log(res)
            if (res.status >= 200 && res.status <= 299) {
                setWarn("Um código foi enviado para o seu email");
                setTimeout(() => {
                    setShowCodeInput(true);
                }, 3000);
            }
        } catch {
            setError("Não foi possivel enviar o email");
        } finally {
            setIsLoading(false);
        }
    }

    const handleVerify = async () => {
        try {
            setIsLoading(true);
            const res = await API.POST(ENDPOINT.AUTH_REGISTER_CODE_VERIFY, { email, code });
            if (res.status >= 200 && res.status <= 299) {
                setTempCode(res.data.temp_token);
                setPass(true);
            }
        } catch {
            setError("Código inválido.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleRegister = async () => {
        try {
            setIsLoading(true);
            const res = await API.POST(ENDPOINT.AUTH_REGISTER, {
                email,
                password,
                temp_token
            });
            if (res.status >= 200 && res.status <= 299) {
                setWarn("Conta criada com sucesso!")
                redirectCard("login")
            }
        } catch {
            setError("Senha inválida");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (code.length >= 6) return setButtonDisabled(false);
        setButtonDisabled(true);
    }, [code]);

    useEffect(() => {
        const isValidEmail = email.length > 8 && email.includes("@");
        if (isValidEmail) {
            const debounceTimeout = setTimeout(() => {
                handleSend();
            }, 1000);
            return () => clearTimeout(debounceTimeout);
        }
    }, [email]);

    return (
        <CardContainer>
            {!pass && <>
                <Title>Criar uma nova conta</Title>
                <Subtitle $isError={error ? true : false}>{warn}</Subtitle>
                <InputGroup>
                    <Input type="email" placeholder="Email" value={email} action={setEmail} />
                    <CodeWrap $show={showCodeInput}>
                        <Input type="text" placeholder="Código" value={code} action={setCode} />
                    </CodeWrap>
                </InputGroup>
                <ButtonGroup>
                    <RowGroup>
                        <TextAchor onClick={handleSwitchTypeCard}>Voltar ao login</TextAchor>
                    </RowGroup>
                    <Button label="Criar conta" action={handleVerify} disabled={(isLoading) || (ButtonDisabled)} />
                </ButtonGroup>
            </>}
            {pass && <>
                <Title>Codigo</Title>
                <Subtitle $isError={error ? true : false}>{warn}</Subtitle>
                <InputGroup>
                    <Input type="password" placeholder="Senha" value={password} action={setPassword} />
                    <Input type="password" placeholder="Confirmar senha" value={passwordConfirm} action={setPasswordConfirm} />
                </InputGroup>
                <ButtonGroup>
                    <RowGroup>
                        <TextAchor onClick={() => setShowCodeInput(false)}>Voltar</TextAchor>
                    </RowGroup>
                    <Button label="Criar conta" action={handleRegister} disabled={isLoading} />
                </ButtonGroup>
            </>}
        </CardContainer>
    )
}