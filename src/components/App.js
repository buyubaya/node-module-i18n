import React from "react";
import i18n from "../libs/i18n";
import { useTranslation, withTranslation, Trans } from "react-i18next";
import TestCollaborator from "./TestCollaborator";
// const Test = (
//     <div>
//         <h1>HELLO TEST</h1>
//         <div>{t("common:test")}</div>
//         <div>{t("another:test")}</div>
//     </div>
// );


function App() {
    const { t, i18n } = useTranslation(["common", "another"]);

    return (
        <TestCollaborator />
    );
}


export default App;