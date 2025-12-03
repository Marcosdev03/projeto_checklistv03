//#region Imports
import { useState } from "react";
import styled from "styled-components";
import { type TaskType } from "@/types/TaskType.ts";
import CheckBox from "@/components/atoms/task/CheckBox";
import ActionButton from "@/components/atoms/buttons/Button-Action";
//#endregion
//#region Styles
const TaskContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-radius: 6px;
    background-color: var(--color-bg-alt);
    border: 1px solid var(--color-border-alt);
    transition: 0.2s ease;

    &:hover {
        border-color: var(--color-accent);
    }
`;

const TaskInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    width: 100%;
`;

const TaskTitle = styled.h2<{ $done?: boolean }>`
    margin: 0;
    font-size: 1.1rem;
    color: ${(p) => (p.$done ? "var(--color-text-invert-alt)" : "var(--color-text-invert)")};
    text-decoration: ${(p) => (p.$done ? "line-through" : "none")};
    transition: 0.2s ease;
`;

const TaskDescription = styled.p<{ $done?: boolean }>`
    margin: 0;
    color: ${(p) =>
        p.$done ? "var(--color-text-invert-alt)" : "var(--color-text-invert-alt)"};
    opacity: ${(p) => (p.$done ? 0.5 : 1)};
`;

const Input = styled.input`
    width: 100%;
    padding: 0.4rem;
    border-radius: 4px;
    border: 1px solid var(--color-border-alt);
    background: var(--color-bg-alt-alt);
    color: var(--color-text-invert);
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 0.4rem;
    border-radius: 4px;
    border: 1px solid var(--color-border-alt);
    background: var(--color-bg-alt-alt);
    color: var(--color-text-invert);
`;

const Actions = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-left: 1rem;
    flex-shrink: 0;
`;

type TaskProps = {
    task: TaskType;
    onUpdate: (updatedTask: TaskType) => Promise<void | TaskType>;
    onDelete: (taskId: number) => void;
};
//#endregion
//#region Component
export default ({ task, onUpdate, onDelete }: TaskProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localTask, setLocalTask] = useState<TaskType>(task);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toggling, setToggling] = useState(false);

    const handleToggleCompleted = async () => {
        const newValue = !localTask.feita;

        const updated = { ...localTask, feita: newValue };
        setLocalTask(updated);

        setToggling(true);
        await onUpdate(updated);
        setToggling(false);
    };

    const handleSave = async () => {
        if (!localTask.nome || localTask.nome.trim() === "") {
            setError("Título é obrigatório");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const result = await onUpdate(localTask);
            if (result) setLocalTask(result as TaskType);
            setIsEditing(false);
        } catch {
            setError("Erro ao salvar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TaskContainer>
            <CheckBox completed={localTask.feita} onToggle={handleToggleCompleted} />

            <TaskInfo>
                {!isEditing ? (
                    <>
                        <TaskTitle $done={localTask.feita}>
                            {localTask.nome}
                        </TaskTitle>

                        {localTask.descricao && (
                            <TaskDescription $done={localTask.feita}>
                                {localTask.descricao}
                            </TaskDescription>
                        )}
                    </>
                ) : (
                    <>
                        <Input
                            value={localTask.nome}
                            onChange={(e) =>
                                setLocalTask({ ...localTask, nome: e.target.value })
                            }
                        />
                        <TextArea
                            value={localTask.descricao ?? ""}
                            onChange={(e) =>
                                setLocalTask({ ...localTask, descricao: e.target.value })
                            }
                            rows={3}
                        />
                        {error && (
                            <small style={{ color: "var(--color-danger)" }}>{error}</small>
                        )}
                    </>
                )}
            </TaskInfo>

            <Actions>
                {!isEditing ? (
                    <>
                        <ActionButton disabled={toggling} onClick={() => setIsEditing(true)}>
                            Editar
                        </ActionButton>

                        <ActionButton
                            delete
                            disabled={toggling}
                            onClick={() => onDelete(task.id)}
                        >
                            Excluir
                        </ActionButton>
                    </>
                ) : (
                    <>
                        <ActionButton disabled={loading} onClick={handleSave}>
                            {loading ? "Salvando..." : "Salvar"}
                        </ActionButton>

                        <ActionButton
                            onClick={() => {
                                setLocalTask(task);
                                setIsEditing(false);
                                setError(null);
                            }}
                        >
                            Cancelar
                        </ActionButton>
                    </>
                )}
            </Actions>
        </TaskContainer>
    );
}
//#endregion