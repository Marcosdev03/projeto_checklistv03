import { useState, useEffect } from "react"
import Login from "../../molecules/login/Login";
import Register from '../../molecules/login/Register';
import Recover from "../../molecules/login/Recover";

// #region Componente
export default () => {

    const [CardType, setCardType] = useState<"login" | "register" | "recover" | "switch_password">("login");
    const [error, setError] = useState("");
    const [warn, setWarn] = useState("");

    // Função para alternar entre os tipos de cartão de autenticação
    const handleSwitchTypeCard = () => {
        if (CardType == "login") return setCardType("register");
        if (CardType == "register") return setCardType("login");
        if (CardType == "recover") return setCardType("login");
    }

    // Limpa os avisos para dar os avisos de sucesso ou aviso de aviso
    const handleWarn = (message: string) => {
        setError("");
        setWarn(message);
    }

    // Coloca o erro na variável de aviso
    useEffect(() => {
        setWarn(error);
    }, [error]);

    // useEffect para limpar os avisos (warn) e erros após 3 segundos. 
    useEffect(() => {
        const timer = setTimeout(() => {
            setWarn("");
            setError("");
        }, 3000);
        return () => clearTimeout(timer);
    }, [warn, error]);

    if (CardType == "login") return (<Login
        error={error}
        warn={warn}
        setError={setError}
        handleSwitchTypeCard={handleSwitchTypeCard}
        redirectCard={setCardType}
    />);

    if (CardType == "register") return (<Register
        error={error}
        warn={warn}
        setError={setError}
        setWarn={handleWarn}
        handleSwitchTypeCard={handleSwitchTypeCard}
        redirectCard={setCardType}
    />)

    return (<Recover
        cardType={CardType}
        error={error}
        warn={warn}
        setError={setError}
        setWarn={handleWarn}
        redirectCard={setCardType}
    />)
}
// #endregion