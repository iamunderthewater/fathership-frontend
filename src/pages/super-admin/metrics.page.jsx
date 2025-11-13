import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";
import axios from "axios";
import Loader from "../../components/loader.component";
import PageNotFound from "../404.page";
import { fillMissingDays } from "../../common/date";
import ChartComponent from "../../components/chart.component";

const WebsiteMetrics = () => {

    let { userAuth: { super_admin, access_token } } = useContext(UserContext);

    const [ metrics, setMetrics ] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchMetrics = () => {
        setLoading(true);
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/stats", {}, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(async ({ data }) => {
            
            const filledData = fillMissingDays(data.recentUsers, 30);
            
            setMetrics({ ...data, recentUsers: filledData });

            setLoading(false);
        })
        .catch(err => {
            setLoading(false);
            console.log(err);
        })
    }

    useEffect(() => {    
        if(access_token && super_admin){
            fetchMetrics()
        }
    
    }, [access_token, super_admin])

    if(loading){ return <Loader /> }

    if(metrics){

        const { usersCount,
            blogsCount,
            reportsCount,
            communitiesCount,
            totalEarning,
            recentUsers } = metrics;

        return (

            <div className="p-5">
                
                <h1 className="text-3xl font-bold">Website Stats</h1>
                <p className="mt-3 mb-10">See useful insights and grasp your business position </p>

                {/* blog Count, category count, report counts */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 grid-cols-1">
                    <div className="w-full border border-grey bg-white p-8 pr-0 flex flex-col gap-4 rounded-md shadow-sm">
                        <h4 className="text-xl whitespace-nowrap">Total Articles</h4>
                        <p className="text-4xl">{blogsCount}</p>
                    </div>
                    <div className="w-full border border-grey bg-white p-8 flex flex-col gap-4 rounded-md shadow-sm">
                        <h4 className="text-xl whitespace-nowrap">Total Communities</h4>
                        <p className="text-4xl">{communitiesCount}</p>
                    </div>
                    <div className="w-full max-sm:col-span-1 max-xl:col-span-2 border border-grey bg-white p-8 flex flex-col gap-4 rounded-md shadow-sm">
                        <h4 className="text-xl whitespace-nowrap">Total Reports</h4>
                        <p className="text-4xl">{reportsCount}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 my-4 max-sm:flex-wrap">
                    <div className="w-full border border-grey bg-white p-8 pr-0 flex flex-col gap-4 rounded-md shadow-sm">
                        <h4 className="text-xl whitespace-nowrap">Total Users</h4>
                        <p className="text-4xl">{usersCount}</p>
                    </div>
                    <div className="w-full border border-grey bg-white p-8 flex flex-col gap-4 rounded-md shadow-sm">
                        <h4 className="text-xl whitespace-nowrap">Total Earnings</h4>
                        <p className="text-4xl">${totalEarning}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 my-4">
                    <div className="w-full border border-grey bg-white p-8 pr-0 flex flex-col gap-4 rounded-md shadow-sm">
                        <h4 className="text-xl whitespace-nowrap">User Signups (Last 30 Days)</h4>
                        <ChartComponent data={recentUsers} />
                    </div>
                </div>

            </div>

        )
    }

    return <PageNotFound />
}

export default WebsiteMetrics;