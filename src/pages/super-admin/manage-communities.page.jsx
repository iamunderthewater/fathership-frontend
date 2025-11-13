import { useContext, useEffect, useRef, useState } from "react";
import Loader from "../../components/loader.component";
import AnimationWrapper from "../../common/page-animation";
import { nanoid } from "nanoid";
import CommunityCard from "../../components/communitycard.component";
import NoDataMessage from "../../components/nodata.component";
import LoadMoreDataBtn from "../../components/load-more.component";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../../App";

const ManageCommunities = () => {

    const { userAuth: { access_token } } = useContext(UserContext);
 
    const communitySearchRef = useRef();

    const [loading, setLoading] = useState(true);
    const [communities, setCommunities] = useState(null);
    const [query, setQuery] = useState("");

    const [deleteCommunity, setDeleteCommunity] = useState(null);

    const fetchCommunities = ({ page, q }) => {

        setLoading(true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-communities", { page, query: q, limit: 30 })
        .then(({ data }) => {
            setLoading(false);
            setCommunities(data.communities);
        })
        .catch(err => {
            console.log(err);
            toast.error("Failed to fetch communities.")
        })

    }

    useEffect(() => {
        if(!communities){
            fetchCommunities({ page: 1, q: "" })
        }
    }, [])

    useEffect(() => {

        if(communities){
            fetchCommunities({ page: 1, q: query })
        }

    }, [query])

    const handleCommunitiesSearch = () => {

        if(!communitySearchRef.current){ return }

        const query = communitySearchRef.current.value;

        setQuery(query);
    }

    const handleDeleteCommunity = () => {

        if(!deleteCommunity){ return }

        const communityIdToDelete = deleteCommunity._id;

        if(!communityIdToDelete){ return setDeleteCommunity(null) }

        setLoading(true)

        // make request to delete the community

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-community", { id: communityIdToDelete }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {

            // filter the communities array

            setCommunities(currentCommunites => {
                
                let localCommunities = [...currentCommunites];
                let newCommunities = localCommunities.filter(item => item._id != communityIdToDelete);

                return [...newCommunities]

            })

            setLoading(false);
            setDeleteCommunity(null);

        })
        .catch(err => {
            setLoading(false);
            setDeleteCommunity(null);
            toast.error("Failed to delete this community.")
            console.log(err)
        })

    }

    return (
        <div className="pb-20">

            {
                deleteCommunity &&
                <div className="fixed top-0 left-0 w-full h-full bg-black/5 z-60 flex items-center justify-center" >
                    <div className="min-w-[250px] w-[90%] max-w-[350px] flex flex-col gap-5 bg-white p-5 px-8 rounded-md pb-8">
                        <h4 className="text-2xl">Are you sure ?</h4>
                        {/* <p>Delete - <span className="font-bold">{capitalize(String(categoryName).substring(0, 20))}</span></p> */}
                        <p className="p-4 bg-red/20"> Are you sure you want to delete {deleteCommunity.name}. By doing so, all posts related to this community and the user's activities will be deleted.</p>

                        <div className="flex flex-wrap gap-3 justify-end">
                            {
                                loading ?
                                    <button disabled className="px-4 py-2 bg-disabled/10 rounded-md text-[#000]">Deleting...</button>
                                :
                                <>
                                    <button className="px-4 py-2 bg-black/10 rounded-md" onClick={() => {setDeleteCommunity(null)}}>Cancel</button>
                                    <button className="px-4 py-2 bg-red rounded-md text-[#fff]" onClick={handleDeleteCommunity}>Delete</button>
                                </>
                            }   
                        </div> 
                    </div>
                </div>
            }

            <div className="w-full py-3 bg-white sticky top-[80px] z-10">
                <h1 className="max-md:hidden">Manage Communities</h1>
                <hr className="w-full my-2 max-md:hidden border-grey" />
                <p>You can search and delete any community from this page as admin.</p>

                <div className=" flex gap-4 items-center max-md:mt-5 md:mt-8 mb-10 border-b border-grey pb-10 sticky top-[150px] bg-white">
                    <input 
                        type="search"
                        className="w-[35%] bg-grey p-4 pl-6 pr-6 rounded-full placeholder:text-dark-grey"
                        placeholder="Search Community..."
                        ref={communitySearchRef}
                    />
                    <button className="rounded-md btn-dark" onClick={handleCommunitiesSearch}>Search</button>
                    {
                        query.length ?
                        <button className="rounded-md btn-light" onClick={() => { setQuery(""); communitySearchRef.current.value = "" }}>Clear</button>
                        :""
                    }
                </div>

                {
                    (communities == null || (loading && !deleteCommunity)) ? <Loader /> :
                    <>
                    {
                        communities.length ?
                            communities.map((community, i) => {

                                return <AnimationWrapper key={nanoid()} transition={{ delay: i*0.08 }}>
                                    <div className="relative flex items-center gap-10 mb-5 py-4 border-b border-grey">
                                        <button className="w-10 h-10 rounded-full bg-red/10 text-red pt-1"><i className="fi fi-rr-trash" onClick={() => { setDeleteCommunity(community) }} /></button>
                                        <CommunityCard community={community} className={"!mb-0 !pb-0 border-none"} />
                                    </div>
                                </AnimationWrapper>
                            })
                        : <NoDataMessage message="Nothing available" />
                    }                    
                    </>
                }

            </div>
        </div>
    )
    
}

export default ManageCommunities;