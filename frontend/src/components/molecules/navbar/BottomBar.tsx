import Button from '../../atoms/buttons/Button-Navbar';
import styled from 'styled-components';
import { Home, CalendarRange, Settings2 } from "lucide-react";
import { useLocation } from '@tanstack/react-router';

const Navbar = styled.nav`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 40px;
    font-size: 24px;
    padding: 0 20px;
    background-color: var(--color-bg-alt-alt);

    @media (max-width: 400px) {
        padding: 0 10px;
    }

    border-bottom: 1px solid var(--color-border-alt);
`

const Main = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    div {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px; 

        h1 {
            font-size: 24px;
        }
    }

    width: 60%;
    @media (max-width: 1300px) {
        width: 80%;
    }
    @media (max-width: 800px) {
        width: 100%;
    }
    @media (max-width: 400px) {
        flex-direction: column-reverse;
        padding: 10px 0;
    }
`

const Div = styled.div`
    @media (max-width: 600px) {
        justify-content: center;
    }
`

const map = {
    home: '/',
    tasks: '/tasks',
    settings: '/settings'
}

export default () => {

    const location = useLocation();
    const path = location.pathname;

    const checkPath = (check: string) => {
        return check == path;
    }

    return (
        <Navbar>
            <Main>
                <Div>
                    <Button icon={<Home size={15} />} to={map.home} selected={checkPath(map.home)}>Home</Button>
                    <Button icon={<CalendarRange size={15} />} to={map.tasks} selected={checkPath(map.tasks)}>Tarefas</Button>
                </Div>
                <Button icon={<Settings2 size={15} />} to={map.settings} selected={checkPath(map.settings)}>Configurações</Button>
            </Main>
        </Navbar>
    )
}