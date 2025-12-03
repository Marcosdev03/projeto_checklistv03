import { useState, useMemo } from "react";

export default () => {

    const [name] = useState<string>(localStorage.getItem("username") ?? "")

    return useMemo(() => {
        return name ? <p>Bem-vindo, {name}!</p> : <p>Bem-vindo!</p>;
    }, [name]);

}