import React from "react";
import i18n from "./libs/i18n";
import { useTranslation, withTranslation, Trans } from "react-i18next";


function App() {
    const { t, i18n } = useTranslation(["common", "another"]);

    return React.createElement(
        "div",
        { className: "App" },
        t("common:test") + t("another:test")
    );
}


export default App;