// #region Imports
import Layout from "../components/templates/navbar/Layout";
import TasksAdd from "@/components/organisms/task/Tasks-Add"
import TasksView from "@/components/organisms/task/Tasks-View";
import { useState } from "react";
// #endregion
// #region Styles
// #endregion
// #region Component
export default () => {
    const [sync, setSync] = useState<boolean>(false);

    return (
        <Layout>
            <TasksAdd sync={sync} setSync={setSync} />
            <TasksView sync={sync} setSync={setSync} />
        </Layout>
    )
}
// #endregion