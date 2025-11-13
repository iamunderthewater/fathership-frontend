import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import { useContext, useEffect, useState } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import { UserContext } from "../App";
import CommunityCard from "../components/communitycard.component";

const HomePage = () => {
    
    let { userAuth, userAuth: { birthdate, gender, interests } } = useContext(UserContext);
    
    let [blogs, setBlog] = useState(null);
    let [trendingBlogs, setTrendingBlog] = useState(null);
    let [communities, setCommunities] = useState(null);
    let [ pageState, setPageState ] = useState({name: null});
    const [categories, setCategories] = useState([]);

    const fetchLatestBlogs = ({ page = 1 }) => {
        
        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page, birthdate, gender, interests })
            .then( async ({ data }) => {

                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    data_to_send: {birthdate, gender, interests},
                    countRoute: "/all-latest-blogs-count"
                })
                
                setBlog(formatedData);
            })
            .catch((err) => {
                console.log(err);
            });
    };
    
    const fetchBlogsByCategory = ({ page = 1 }) => {
        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { category: pageState, page })
            .then( async ({ data }) => {
                
                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/search-blogs-count",
                    data_to_send: { category: pageState._id }
                })
                
                setBlog(formatedData);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const fetchCommunities = ({ page = 1 }) => {
        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-communities", { page })
            .then( async ({ data }) => {
                
                let formatedData = await filterPaginationData({
                    state: communities,
                    data: data.communities,
                    page,
                    countRoute: "/search-communities-count",
                })

                setCommunities(formatedData);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const fetchTrendingBlogs = () => {
        axios
            .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
            .then(({ data }) => {
                setTrendingBlog(data.blogs);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const loadBlogByCategory = (cat) => {
        
        // let category = e.target.innerText.toLowerCase(); 

        setBlog(null);

        if(pageState.name == cat.name){
            setPageState({ name: "home" });
            return;
        }

        setPageState(cat);

    }

    useEffect(() => {

        if(userAuth && pageState.name){
            activeTabRef.current.click();

            if(pageState.name == "home"){
                fetchLatestBlogs({ page: 1 });
            } else {
                fetchBlogsByCategory({ page: 1 })
            }

            if(!communities){
                fetchCommunities({ page: 1 });
            }

            if(!trendingBlogs){
                fetchTrendingBlogs();
            }
        }

    }, [pageState]);

    useEffect(() => {

        if(userAuth){
            setPageState({ name: "home" })
        }

    }, [userAuth])

    useEffect(() => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/top-categories")
        .then(res => setCategories(res.data.categories))
        .catch(err => console.log(err))
    }, [])

    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                {/* latest blogs */}
                <div className="w-full">
                    <InPageNavigation
                        routes={[ pageState.name , "communities", "trending articles" ]}
                        defaultHidden={["trending articles"]}
                    >
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
                            <LoadMoreDataBtn state={blogs} fetchDataFun={( pageState.name == "home" ? fetchLatestBlogs : fetchBlogsByCategory )} />
                        </>

                        <>
                            {communities == null ? (
                                <Loader />
                            ) : (
                                communities.results.length ? 
                                    communities.results.map((community, i) => {
                                        return (
                                            <AnimationWrapper
                                                transition={{
                                                    duration: 1,
                                                    delay: i * 0.1,
                                                }}
                                                key={i}
                                            >
                                                <CommunityCard
                                                    community={community}
                                                />
                                            </AnimationWrapper>
                                        );
                                    })
                                : <NoDataMessage message="No communities found" />
                            )}
                            <LoadMoreDataBtn state={communities} fetchDataFun={fetchCommunities} />
                        </>

                        {trendingBlogs == null ? (
                            <Loader />
                        ) : (
                            trendingBlogs.length ?
                                trendingBlogs.map((blog, i) => {
                                    return (
                                        <AnimationWrapper
                                            transition={{
                                                duration: 1,
                                                delay: i * 0.1,
                                            }}
                                            key={i}
                                        >
                                            <MinimalBlogPost
                                                blog={blog}
                                                index={i}
                                            />
                                        </AnimationWrapper>
                                    );
                                })
                            : <NoDataMessage message="No trending blogs" />
                        )}
                    </InPageNavigation>
                </div>

                {/* filters and trending blogs */}
                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
                    <div className="flex flex-col gap-10">
                        <div>
                            <h1 className="font-medium text-xl mb-8">
                                Stories from all interests
                            </h1>

                            <div className="flex gap-3 flex-wrap">
                                {categories.map((category, i) => {
                                    return (
                                        <button onClick={() => loadBlogByCategory(category)} className={"tag " + (pageState.name == category.name ? " bg-black text-white " : " ")} 
                                        key={i}>
                                            {category.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h1 className="font-medium text-xl mb-8">
                                Trending
                                <i className="fi fi-rr-arrow-trend-up"></i>
                            </h1>

                            {trendingBlogs == null ? (
                                <Loader />
                            ) : (
                                trendingBlogs.length ? 
                                    trendingBlogs.map((blog, i) => {
                                        return (
                                            <AnimationWrapper
                                                transition={{
                                                    duration: 1,
                                                    delay: i * 0.1,
                                                }}
                                                key={i}
                                            >
                                                <MinimalBlogPost
                                                    blog={blog}
                                                    index={i}
                                                />
                                            </AnimationWrapper>
                                        );
                                    })
                                : <NoDataMessage message="No trending articles" />
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </AnimationWrapper>
    );
};

export default HomePage;
