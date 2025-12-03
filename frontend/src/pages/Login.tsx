// #region Imports
import { useState, useEffect } from "react"
import Desktop from "../components/templates/login/Desktop";
import Mobile from "../components/templates/login/Mobile";
// #endregion
// #region Scripts
const Window = () => { // Função para obter as dimensões da janela
    const { innerWidth: width, innerHeight: height } = window;
    return { width, height };
}
// #endregion
// #region Component
export default () => {

    // Estado para armazenar as dimensões da janela
    const [windowSize, setWindowSize] = useState(Window());

    // Efeito para atualizar as dimensões da janela ao redimensionar
    useEffect(() => {
        const handleResize = () => {
            setWindowSize(Window());
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Responsividade baseada na largura da janela utilizando useState e useEffect
    return (
        <>
            {windowSize.width > 1300 ? (
                <Desktop />
            ) : (
                <Mobile />
            )}
        </>
    )
}
// #endregion