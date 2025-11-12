import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";
import PageNotFound from "../404.page";
import axios from "axios";
import { filterPaginationData } from "../../common/filter-pagination-data";
import Loader from "../../components/loader.component";
import AnimationWrapper from "../../common/page-animation";
import NoDataMessage from "../../components/nodata.component";
import LoadMoreDataBtn from "../../components/load-more.component";
import ActivityCard from "../../components/activity-card.component";
import { nanoid } from "nanoid";

const ActivitiesLog = () => {

    let { userAuth: { super_admin, access_token } } = useContext(UserContext)

    const [ filter, setFilter ] = useState('all');
    const [ activities, setActivites ] = useState(null);

    let filters = ['all', 'users', 'blogs', 'comments'];

    const fetchActivities = ({ page, deletedDocCount = 0 }) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/super-admin/activities", { page, filter, deletedDocCount }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(async ({ data: { activities: data } }) => {

            let formatedData = await filterPaginationData({
                state: activities,
                data, page,
                countRoute: "/all-activities-count",
                data_to_send: { filter },
                user: access_token
            })
            setActivites(formatedData)

        })
        .catch(err => {
            console.log(err);
        })
    }

    useEffect(() => {    
        if(access_token && super_admin){
            fetchActivities({ page: 1 })
        }
    
    }, [access_token, super_admin, filter])

    // useEffect(() => {console.log(activities)}, [activities])

    const handleFilter = (e) => {

        let btn = e.target;

        setFilter(btn.innerHTML);

        setActivites(null);

    }

    if(!super_admin || !access_token){
        return <PageNotFound />
    }

    return (
        <div className="pb-20">

            <div className="w-full py-3 bg-white sticky top-[80px] z-10">
                <h1 className="max-md:hidden">Public Activites</h1>

                <div className="my-8 flex gap-6">
                    {
                        filters.map((filterName, i) => {
                            return <button key={i} className={"py-2 " + ( filter == filterName ? "btn-dark" : "btn-light" )}
                            onClick={handleFilter}>{filterName}</button>
                        })
                    }
                </div>
            </div>

            {
                activities == null ? <Loader /> :
                <>
                   {
                        activities.results.length ?
                            activities.results.map((activity, i) => {
    
                                return <AnimationWrapper key={nanoid()} transition={{ delay: i*0.08 }}>
                                    <ActivityCard data={activity} setData={setActivites} index={i} />
                                </AnimationWrapper>
                            })
                        : <NoDataMessage message="Nothing available" />
                   }

                   <LoadMoreDataBtn state={activities} fetchDataFun={fetchActivities} additionalParam={{ deletedDocCount: activities.deletedDocCount }} />
                    
                </>
            }
        </div>
    )
}

export default ActivitiesLog;