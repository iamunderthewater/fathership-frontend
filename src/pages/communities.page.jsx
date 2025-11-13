import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CommunitiesContext, UserContext } from "../App";
import axios from "axios";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import CommunityCard from "../components/communitycard.component";

const Communities = () => {

    const { joinedCommunities, setJoinedCommunities, showSidePanel, setShowSidePanel } = useContext(CommunitiesContext);
    const { userAuth: { access_token } } = useContext(UserContext);

    const navigate = useNavigate();
    const location = useLocation();

    const fetchJoinedCommunities = () => {

        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/joined-communities", {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then((res) => {
            setJoinedCommunities(res.data.communities);
        })
        .catch(err => {
            console.log(err);
        })

    }

    useEffect(() => {

        if(access_token && !joinedCommunities){
            fetchJoinedCommunities()
        }

        return () => {
            setJoinedCommunities(null);
        }

    }, [access_token])

    useEffect(() => {

        if(joinedCommunities && joinedCommunities.length && location.pathname == "/communities"){
            navigate(`/communities/${joinedCommunities[0].community_id}`)
        }

    }, [joinedCommunities, location])

    return (
        <section className="relative p-0 flex">

            {/* create communities button */}
            
            <div className={"duration-0 max-lg:fixed max-lg:z-60 max-lg:bottom-0 max-lg:w-full bg-white w-[300px] sticky top-[80px] border-r border-grey h-[calc(100vh-100px)] " + (showSidePanel ? " max-lg:left-0 ": " max-lg:left-[-100%] ")}>
                <div className="p-5 flex gap-3 items-center">
                    <Link to={"/create-community"} className=" py-4 px-6 w-full rounded-full border border-dark-grey flex gap-6 items-center">
                        <i className="fi fi-rr-pencil" />
                        <p>Create Community</p>
                    </Link>
                    {
                        (joinedCommunities && joinedCommunities.length) ? 
                        <button className="lg:hidden w-16 h-14 flex items-center justify-center rounded-full bg-black text-white " onClick={() => { setShowSidePanel(false) }}>
                            <i className="fi fi-rr-x" />
                        </button> : ""
                    }
                </div>

                <div className="border-t border-grey">

                    {
                        joinedCommunities == null ? <Loader />
                        :
                        joinedCommunities.length ?
                            joinedCommunities.map((community, i) => {
                                return <CommunityCard key={community.community_id} className={"p-4 mb-0 " + (i==0 ? "bg-black/10" :"")} community={community} />
                            })
                        : <div className="px-3"><NoDataMessage message={"No joined communites. Join a community by searching them on the search box."} /></div>
                    }

                </div>

            </div>

            <div className="w-full lg:max-w-[calc(100vw-300px)]">

                <button onClick={() => { setShowSidePanel(true) }} className="btn-light py-1 px-3 rounded-sm mt-6 bg-grey/50 ml-[5vw] lg:!hidden mb-5">
                    Communities Tab
                </button>

                <Outlet />
            </div>

        </section>
    )
}

export default Communities;