import styled from "styled-components";
import { useState } from "react";
import Button from "@/components/atoms/buttons/Button-Confirm";
import API, { ENDPOINT } from "@/utils/API";

const LoadingSpinner = styled.div`
    border: 4px solid var(--color-border-alt);
    border-top: 4px solid var(--color-accent);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    animation: spin 0.8s linear infinite;
    margin: 0 auto;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;


const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 1rem;
    gap: 1rem;
    background-color: var(--color-bg-alt-alt);
    border: 1px solid var(--color-border-alt);
    border-radius: 4px;
    font-family: "Delius";
`;

const Input = styled.input`
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border-radius: 4px;

    color: var(--color-text-invert);
    background-color: var(--color-bg-alt-alt);
    border: 1px solid var(--color-border-alt);
    font-family: "Delius";

    &:focus {
        outline: none;
        border-color: var(--color-primary);
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    height: 80px;
    min-height: 80px; 
    max-height: 200px; 
    resize: vertical; 
    cursor: text;

    padding: 0.5rem;
    font-size: 1rem;
    border-radius: 4px;

    color: var(--color-text-invert);
    background-color: var(--color-bg-alt-alt);
    border: 1px solid var(--color-border-alt);

    &:focus {
        outline: none;
        border-color: var(--color-primary);
    }
`;

type AddTasksProps = {
    sync: boolean;
    setSync: (value: boolean) => void;
};

export default ({ setSync }: AddTasksProps) => {
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await API.POST(ENDPOINT.TASK_CRUD + "/", {
                nome: name,
                descricao: description,
                feita: false
            })
            setSync(true);
            setName("");
            setDescription("");
        } catch {

        } finally {
            setLoading(false);
        }
    }

    return (
        <Container>
            <h1>Novas tarefas</h1>
            <Input
                type="text"
                placeholder="Nome da tarefa..."
                onChange={(e) => setName(e.target.value)}
                value={name}
            />
            <TextArea
                placeholder="Descrição da tarefa..."
                onChange={(e) => setDescription(e.target.value)}
                value={description}
            />

            {loading ? (
                <LoadingSpinner />
            ) : (
                <Button
                    type="submit"
                    label="Adicionar Tarefa"
                    disabled={!(name && description)}
                    action={handleSubmit}
                />
            )}
        </Container>
    );
}