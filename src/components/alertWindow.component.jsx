import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import { capitalize } from "../common/capitalize";
import { Link } from "react-router-dom";

const Alerts = () => {
    const [activeAlert, setActiveAlert] = useState(0);

    const {
        userAuth,
        userAuth: { access_token, alerts },
        setUserAuth,
    } = useContext(UserContext);

    const clearAlerts = () => {
        axios
            .get(import.meta.env.VITE_SERVER_DOMAIN + "/clear-alerts", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            })
            .then(({ data }) => {
                // update the context
                setUserAuth({ ...userAuth, alerts: [] });
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-white z-60 flex justify-center pt-10">
            <div className="min-w-[250px] w-[90%] flex flex-col gap-8 bg-white p-5 px-8 rounded-md pb-8">
                <h4 className="text-3xl font-medium">
                    Important Alerts! ({activeAlert + 1}/{alerts.length})
                </h4>

                <div className="w-full flex gap-5 flex-col rounded-md">
                    <p className="text-xl">
                        {alerts[activeAlert].type == "warn"
                            ? " You "
                            : ` Your ${alerts[activeAlert].type} - `}{" "}
                        {
                            alerts[activeAlert].type != "warn" &&
                            <span className="text-xl font-semibold">
                                "{alerts[activeAlert].content}"
                            </span>
                        }{" "}
                        {alerts[activeAlert].type == "warn" ? " have " : "has"}{" "}
                        been{" "}
                        <span className="text-xl font-semibold">
                            {alerts[activeAlert].action}{" "}
                        </span>
                        by Admin.
                    </p>
                    <p className="p-4 bg-red/10 border border-red text-red rounded-md px-6 flex gap-4 items-start text-xl">
                        <i className="fi fi-sr-exclamation mt-1"></i>
                        {alerts[activeAlert].type == "warn"
                            ? "Warning"
                            : "Reason"}
                        - {capitalize(alerts[activeAlert].reason)}
                    </p>

                    {
                        alerts[activeAlert].img ? alerts[activeAlert].img.length && 
                        <Link target="_blank" to={alerts[activeAlert].img} className="underline text-purple ">View attached proof for this action</Link>
                        : ""
                    }

                </div>

                <div className="flex gap-3 items-center">
                    <button
                        className="px-4 py-2 rounded-md bg-dark-grey/10 text-black"
                        onClick={clearAlerts}
                    >
                    {alerts.length > 1 ? "Close alerts" : "Close"}
                    </button>
                    {alerts.length - 1 > activeAlert && (
                        <button
                            className="py-2 px-5 rounded-md bg-black text-white select-none"
                            onClick={() => {
                                setActiveAlert((current) => current + 1);
                            }}
                        >
                            Next
                        </button>
                    )}
                </div>
                {}
            </div>
        </div>
    );
};

export default Alerts;
