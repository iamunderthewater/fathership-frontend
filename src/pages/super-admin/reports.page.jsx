import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";
import PageNotFound from "../404.page";
import axios from "axios";
import { filterPaginationData } from "../../common/filter-pagination-data";
import Loader from "../../components/loader.component";
import AnimationWrapper from "../../common/page-animation";
import NoDataMessage from "../../components/nodata.component";
import LoadMoreDataBtn from "../../components/load-more.component";
import { nanoid } from "nanoid";
import ReportCard from "../../components/report-card.component";

const ManageReports = () => {

    let { userAuth: { super_admin, access_token } } = useContext(UserContext)

    const [ filter, setFilter ] = useState('all');
    const [ reports, setReports ] = useState(null);

    let filters = ['all', 'users', 'blogs', 'comments'];

    const fetchReports = ({ page, deletedDocCount = 0 }) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/super-admin/reports", { page, filter, deletedDocCount }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(async ({ data: { reports: data } }) => {

            let formatedData = await filterPaginationData({
                state: reports,
                data, page,
                countRoute: "/all-reports-count",
                data_to_send: { filter },
                user: access_token
            })
            setReports(formatedData)

        })
        .catch(err => {
            console.log(err);
        })
    }

    useEffect(() => {    
        if(access_token && super_admin){
            fetchReports({ page: 1 })
        }
    
    }, [access_token, super_admin, filter])

    // useEffect(() => {console.log(reports)}, [reports])

    const handleFilter = (e) => {

        let btn = e.target;

        setFilter(btn.innerHTML);

        setReports(null);

    }

    if(!super_admin || !access_token){
        return <PageNotFound />
    }

    return (
        <div className="pb-20">

            <div className="w-full py-3 bg-white sticky top-[80px] z-10">
                <h1 className="max-md:hidden">Reports / Complaints</h1>

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
                reports == null ? <Loader /> :
                <>
                   {
                        reports.results.length ?
                            reports.results.map((report, i) => {
    
                                return <AnimationWrapper key={nanoid()} transition={{ delay: i*0.08 }}>
                                    <ReportCard data={report} setData={setReports} index={i} />
                                </AnimationWrapper>
                            })
                        : <NoDataMessage message="Nothing available" />
                   }

                   <LoadMoreDataBtn state={reports} fetchDataFun={fetchReports} additionalParam={{ deletedDocCount: reports.deletedDocCount }} />
                    
                </>
            }
        </div>
    )
}

export default ManageReports;