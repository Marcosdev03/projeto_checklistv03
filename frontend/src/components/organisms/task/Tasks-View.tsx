import { useEffect, useState } from "react";
import styled from "styled-components";
import Task from "@/components/molecules/tasks/Container.tsx";
import { type TaskType } from "@/types/TaskType";
import API, { ENDPOINT } from "@/utils/API";

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

    height: 100%;
    overflow-y: auto;

    scrollbar-width: thin; 
    scrollbar-color: var(--color-accent) var(--color-border-alt-alt);
`;

const SkeletonView = styled.div`
    width: 100%;
    height: 100px;
    background-color: var(--color-bg-alt);
    border: 1px solid var(--color-border-alt);
    border-radius: 4px;
    animation: pulse 1.5s infinite;

    @keyframes pulse {
        0% {
            background-color: var(--color-bg-alt);
        }
        50% {
            background-color: var(--color-bg-alt-alt);
        }
        100% {
            background-color: var(--color-bg-alt);
        }
    }
`;

const NoTasks = styled.h1`
    text-align: center;
    color: var(--color-text-invert-alt);
`;

type ViewTasks = {
    sync: boolean;
    setSync: (value: boolean) => void;
};

export default ({ sync, setSync }: ViewTasks) => {
    const [tasks, setTasks] = useState<Array<TaskType>>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // ---------------------------------------------------------
    // FETCH
    // ---------------------------------------------------------
    const handleFetchTasks = async () => {
        setLoading(true);
        try {
            const response = await API.GET(ENDPOINT.TASK_CRUD);
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleFetchTasks();
    }, []);

    useEffect(() => {
        if (sync) {
            handleFetchTasks();
            setSync(false);
        }
    }, [sync])

    // ---------------------------------------------------------
    // UPDATE
    // ---------------------------------------------------------
    const handleUpdateTask = async (updatedTask: TaskType) => {
        try {
            await API.PATCH(`${ENDPOINT.TASK_CRUD}/${updatedTask.id}`, updatedTask);
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === updatedTask.id ? updatedTask : task
                )
            );
        } catch (error) {
            console.error("Erro ao atualizar a task:", error);
        }
    };

    // ---------------------------------------------------------
    // DELETE
    // ---------------------------------------------------------
    const handleDeleteTask = async (taskId: number) => {
        const oldState = tasks;
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        try {
            await API.DELETE(`${ENDPOINT.TASK_CRUD}/${taskId}`);
        } catch (error) {
            console.error("Erro ao deletar task:", error);
            setTasks(oldState);
        }
    };

    return (
        <>
            <Container>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => <SkeletonView key={i} />)
                ) : tasks.length ? (
                    tasks.map((task) => (
                        <Task
                            key={task.id}
                            task={task}
                            onUpdate={handleUpdateTask}
                            onDelete={handleDeleteTask}
                        />
                    ))
                ) : (
                    <NoTasks>Sem tarefas :( </NoTasks>
                )}
            </Container>
        </>
    );
};