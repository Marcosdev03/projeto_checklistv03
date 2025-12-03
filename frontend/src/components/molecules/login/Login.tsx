// Imports de estilos
import { CardContainer, Title, Subtitle, InputGroup, ButtonGroup, RowGroup, TextAchor } from "./Auth.style";
import Button from "../../atoms/buttons/Button-Confirm";
import Input from "../../atoms/login/Login-Text-Field";

// Imports React e API
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import API, { ENDPOINT, Coockie } from "../../../utils/API";

type Login = {
    warn: string;
    error: string;
    setError: (message: string) => void;
    handleSwitchTypeCard: () => void;
    redirectCard: (type: "login" | "register" | "recover" | "switch_password") => void;
}

export default ({ setError, error, warn, handleSwitchTypeCard, redirectCard }: Login) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            const res = await API.POST(ENDPOINT.AUTH_LOGIN, { email, password });
            if (res.status >= 200 && res.status <= 299) {
                Coockie.setAccess(res.data.access);
                Coockie.setRefresh(res.data.refresh);
                if (!res.data.has_username) {
                    sessionStorage.setItem("noNameChanged", "true")
                }
                localStorage.setItem("username", res.data.current_username)
                console.log('Login realizado com sucesso!');
                return navigate({ to: '/' });
            }

            setError("Conta ou senha inválidos.");
        } catch {
            setError("Conta ou senha inválidos.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <CardContainer>
            <Title>Entrar na conta</Title>
            <Subtitle $isError={error ? true : false}>{warn}</Subtitle>
            <InputGroup>
                <Input type="email" placeholder="Email" value={email} action={setEmail} />
                <Input type="password" placeholder="Senha" value={password} action={setPassword} />
            </InputGroup>
            <ButtonGroup>
                <RowGroup>
                    <TextAchor onClick={() => handleSwitchTypeCard()}>Registre-se</TextAchor>
                    <TextAchor onClick={() => { setEmail(""); redirectCard("recover") }}>Esqueceu sua senha?</TextAchor>
                </RowGroup>
                <Button label="Entrar" action={handleLogin} disabled={isLoading} />
            </ButtonGroup>
        </CardContainer>
    )
}