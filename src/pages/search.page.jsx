import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/usercard.component";
import CommunityCard from "../components/communitycard.component";

const SearchPage = () => {

    let { query } = useParams()

    let [ blogs, setBlog ] = useState(null);
    let [ communities, setCommunities ] = useState(null);
    let [ users, setUsers ] = useState(null);

    const searchBlogs = ({ page = 1, create_new_arr = false }) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { query, page })
        .then( async ({ data }) => {

            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { query },
                create_new_arr
            })

            setBlog(formatedData);
        })
        .catch((err) => {
            console.log(err);
        });

    }

    const searchCommunities = ({ page = 1, create_new_arr = false }) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-communities", { query, page })
        .then( async ({ data }) => {

            let formatedData = await filterPaginationData({
                state: communities,
                data: data.communities,
                page,
                countRoute: "/search-communities-count",
                data_to_send: { query },
                create_new_arr
            })

            setCommunities(formatedData);
        })
        .catch((err) => {
            console.log(err);
        });

    }

    const searchUsers = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
        .then(({ data : { users } } ) => {
            setUsers(users);
        })
    }

    useEffect(() => {

        resetState();
        searchBlogs({ page: 1, create_new_arr: true });
        searchCommunities({ page: 1, create_new_arr: true });
        searchUsers();

    }, [query])

    const resetState = () => {
        setBlog(null);
        setUsers(null);
        setCommunities(null);
    }

    const UserCardWrapper = () => {
        return (
            <>
                {
                    users == null ? <Loader /> :
                        users.length ? 
                            users.map((user, i) => {
                                return <AnimationWrapper key={i} transition={{ duration: 1, delay: i*0.08 }}>
                                    <UserCard user={user} />
                                </AnimationWrapper>
                            })
                        : <NoDataMessage message="No user found" />
                }
            </>
        )
    }

    const CommunitiesCardWrapper = () => {
        return (
            <>
                {
                    communities == null ? <Loader /> :
                        communities.results.length ? 
                            communities.results.map((community, i) => {
                                return <AnimationWrapper key={i} transition={{ duration: 1, delay: i*0.08 }}>
                                    <CommunityCard community={community} />
                                </AnimationWrapper>
                            })
                        : <NoDataMessage message="No communities found" />
                }
                <LoadMoreDataBtn state={communities} fetchDataFun={searchCommunities} />
            </>
        )
    }

    return (
        <section className="h-cover flex justify-center gap-10">

            <div className="w-full">
                <InPageNavigation routes={[`Articles`, "Communities" , "Accounts Matched"]} defaultHidden={["Accounts Matched"]} >

                    <>
                        {blogs == null ? (
                                <Loader />
                            ) : (
                                blogs.results.length ? 
                                    blogs.results.map((blog, i) => {
                                        return (
                                            <AnimationWrapper
                                                transition={{
                                                    duration: 1,
                                                    delay: i * 0.1,
                                                }}
                                                key={i}
                                            >
                                                <BlogPostCard
                                                    content={blog}
                                                    author={
                                                        blog.author.personal_info
                                                    }
                                                />
                                            </AnimationWrapper>
                                        );
                                    })
                                : <NoDataMessage message="No articles published" />
                            )}
                            <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />
                    </>

                    {
                        // communities list
                    }
                    <CommunitiesCardWrapper />

                    <UserCardWrapper />

                </InPageNavigation>
            </div>

            <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">

                <h1 className="font-medium text-xl mb-8">User related to search <i className="fi fi-rr-user mt-1"></i></h1>  

                <UserCardWrapper />            

            </div>

        </section>
    )
}

export default SearchPage;