import { useContext } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { UserContext } from "../App";

const ChartComponent = ({ data }) => {

    const { theme } = useContext(UserContext);

    if (!data || data.length === 0) {
        return <div className="text-gray-500">No data available</div>;
    }

    return (
        <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        interval="preserveStartEnd"
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                        formatter={(value) => [value, "Signups"]}
                        labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                        type="monotone"
                        dataKey="count"
                        name="Signups"
                        stroke={theme == "light" ? "#c000ff" : "#e38eff"}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ChartComponent;
