import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"
import { getFullDay } from "../common/date";
import Loader from "../components/loader.component";
import { CommunitiesContext, UserContext } from "../App";
import toast from "react-hot-toast";
import NoDataMessage from "../components/nodata.component";
import UserCard from "../components/usercard.component";
import InputBox from "../components/input.component";
import { uploadImage } from "../common/aws";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const CommunityPage = () => {

    const { community_id } = useParams(); 

    const { userAuth: { access_token, username, profile_img } } = useContext(UserContext);
    const { joinedCommunities, setJoinedCommunities, setShowSidePanel } = useContext(CommunitiesContext);

    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(false);
    const [membersPanel, setMembersPanel] = useState(false);
    const [members, setMembers] = useState(null);
    const [activeOnSidePanel, setActiveonSidePanel] = useState(false);

    const [kickConfirmation, setKickConfirmation] = useState(null);
    const [communityDeleteWindow, setCommunityDeleteWindow] = useState(false);
    const [ posts, setPosts ] = useState(null);


    const [joined, setJoined] = useState(null);

    const navigate = useNavigate();

    // post fields

    const textareaRef = useRef();
    const postImageInp = useRef();
    
    const [postImage, setPostImage] = useState(null);

    const handleImagePreview = (e) => {
        let img = e.target.files[0];
        setPostImage(img);
    }

    useEffect(() => {

        if(joinedCommunities != null && community && !activeOnSidePanel){
            setJoinedCommunities(currentCommunities => {

                const localCommunities = [...currentCommunities];

                // remove the community from the current state to bring it at the top is existing.
                let sanitizedList = localCommunities.filter((item) => item.community_id != community.community_id);

                return [ { name: community.name, image: community.image, community_id: community_id }, ...sanitizedList ]

            })
            setActiveonSidePanel(true);
            setShowSidePanel(false);
        }

    }, [community, joinedCommunities])

    //fetch community details

    const fetchCommunityInfo = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + `/community/${community_id}`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(res => {
            setCommunity(res.data.community);
            setJoined(res.data.joinStatus);
            fetchPosts({ page: 1 });
        })
        .catch(err => {
            console.log(err);
            navigate("/404")
        })
    }

    const fetchMembers = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + `/community-members?id=${community_id}`)
        .then(res => {
            setMembers(res.data.members)
        })
        .catch(err => console.log(err))
    }

    const fetchPosts = ({ page, deletedDocCount = 0 }) => {
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + `/community-posts`, { page, deletedDocCount, community_id })
        .then(async ({ data: { posts: data } }) => {

            let formatedData = await filterPaginationData({
                state: posts,
                data, page,
                create_new_arr: page == 1,
                data_to_send: { community_id },
                countRoute: "/all-posts-count/",
            })

            setPosts(formatedData)

        })
        .catch(err => {
            console.log(err);
            navigate("/404")
        })

    }

    useEffect(() => {
        
        if(access_token){
            fetchCommunityInfo();
            fetchMembers();
        }

        return () => {
            resetStates();
        }

    }, [access_token, community_id])

    const resetStates = () => {
        setCommunity(null);
        setActiveonSidePanel(false);
        setPostImage(null);
        setLoading(false);
        setMembersPanel(false);
        setMembers(null);
        setKickConfirmation(null);
        setPosts(null);
        setJoined(null);
        setCommunityDeleteWindow(false);

        if(textareaRef && textareaRef.current){
            textareaRef.current.value = "";
        }

        if(postImageInp && postImageInp.current){
            postImageInp.current.value = "";
        }

    }
    
    if(!community){ return <Loader /> }

    const handleJoinOrLeave = () => {

        setLoading(true);
        let action = joined ? "leave" : "join";

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/join-leave-community", { community_id, action }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then((res) => {
            setLoading(false);
            if(!res.data.doc){ return }
            
            setJoined(prev => !prev);

            // update community total members count
            setCommunity(currentState => {

                let localMembersCount;
                
                if(action == "join") { localMembersCount = currentState.membersCount + 1 }
                else if(action == "leave") { localMembersCount = currentState.membersCount - 1 }

                return { ...currentState, membersCount: localMembersCount }

            })

            // update members list locally

            setMembers(currentMembers => {

                const localMembersList = [...currentMembers];

                let newMembers = [];

                if(action == "join"){ // add the user in members list
                    newMembers = [ { personal_info: { username, profile_img } } , ...localMembersList]
                }
                else if(action == "leave"){ // remove the user from members list
                    newMembers = localMembersList.filter(item => item.personal_info.username !== username);
                }

                return [...newMembers];

            })

        })
        .catch(err => {
            console.log(err);
            setLoading(false);
            return toast.error("Failed to execute your action.")
        })


    }

    const kickMember = () => {

        setLoading(true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/join-leave-community", { community_id, action: "kick", member: kickConfirmation._id }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {

            // update the local data

            // update community total members count
            setCommunity(currentState => {

                let localMembersCount = currentState.membersCount - 1;

                return { ...currentState, membersCount: localMembersCount }

            })

            // update members list locally

            setMembers(currentMembers => {

                const localMembersList = [...currentMembers];

                let newMembers =  localMembersList.filter(item => item.personal_info.username !== kickConfirmation.personal_info.username);

                return [...newMembers];

            })

            // update posts loaded for deleted member's post

            setPosts(currentPosts => {

                const localPosts = { ...currentPosts };

                const localResults = [...localPosts.results];
                const filteredResults = localResults.filter(item => item.post_by._id != kickConfirmation._id);

                const docsDifference = localResults.length - filteredResults.length;

                return {
                    ...localPosts,
                    results: filteredResults,
                    totalDocs: localPosts.totalDocs - docsDifference,
                    deletedDocCount: localPosts.deletedDocCount + docsDifference
                }

            })

            setKickConfirmation(null);
            setLoading(false);
            toast.success("Member removed from the community successfully.")
        })
        .catch(err => {
            console.log(err);

            setKickConfirmation(null);
            setLoading(false);

            return toast.error("Unable to process your requestion at this moment.")
        })
        
    }

    const createPost = async () => {

        if(!textareaRef.current || !access_token || !community_id){ return }

        const text = textareaRef.current.value;

        if(!text.length && !postImage){ return }

        // save the post

        setLoading(true);

        // upload image and get the url if postImage is present

        let postImageUrl = "";

        if(postImage){
            postImageUrl = await uploadImage(postImage);
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-post", { text, image: postImageUrl, community_id }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(res => {
            setLoading(false);

            // update posts state

            setPosts(currentPosts => {

                let localPosts = { ...currentPosts };

                let localResults = [...localPosts.results];
                
                return {
                    ...localPosts,
                    results: [ { text, image: postImageUrl, community: community._id, post_by: { personal_info: { username, profile_img } }, _id: res.data.id, createdAt: new Date() } , ...localResults],
                    totalDocs: localPosts.totalDocs + 1,
                    deletedDocCount: localPosts.deletedDocCount - 1,
                }

            })

            // reseting the fields
            textareaRef.current.value = "";
            setPostImage(null);
            postImageInp.current.value = "";
            
        })
        .catch(err => {
            setLoading(false);
            console.log(err);
            toast.error("Failed to create the post.")
        })
        
    }

    const deleteCommunity = () => {

        setCommunityDeleteWindow(false);
            
        if(!community._id){ return }

        setLoading(true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-community", { id: community._id }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(res => {
            location.href = "/communities"
        })
        .catch(err => {
            console.log(err);
            toast.error("Failed to delete the community")
        })
        
    }

    return (
        <div>

            {loading && <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white/80 z-60"><Loader /></div>}

            {
                kickConfirmation != null &&
                <div className="w-full h-full flex items-center justify-center fixed top-0 left-0 bg-black/20 z-50">

                    <div className="bg-white p-6 px-8 rounded-md max-w-[350px] w-[95%]">
                        <h4 className="text-xl font-medium">Are you sure?</h4>
                        <p className="mt-7 mb-12">You are about to kick @{kickConfirmation.personal_info.username} from "{community.name}" community as an admin.</p>
                        <div className="flex items-center gap-3">
                            <button className="btn-light bg-none hover:bg-grey" onClick={() => { setKickConfirmation(null) }}>Cancel</button>
                            <button className="btn-dark bg-red text-[#fff]" onClick={kickMember}>Kick</button>
                        </div>
                    </div>

                </div>
            }

            {
                communityDeleteWindow &&
                <div className="w-full h-full flex items-center justify-center fixed top-0 left-0 bg-black/20 z-50">

                    <div className="bg-white p-6 px-8 rounded-md max-w-[350px] w-[95%]">
                        <h4 className="text-xl font-medium">Are you sure?</h4>
                        <p className="mt-7 mb-12">You are about to delete this community as an admin. All the posts along with all the activites related to this community will be deleted. Once deleted, you cannot recover the data again. Confirm delete by clicking on delete button.</p>
                        <div className="flex items-center gap-3">
                            <button className="btn-light bg-none hover:bg-grey" onClick={() => { setCommunityDeleteWindow(null) }}>Cancel</button>
                            <button className="btn-dark bg-red text-[#fff]" onClick={deleteCommunity}>Delete</button>
                        </div>
                    </div>

                </div>
            }

            {/* community info page */}
            
            {/* banner */}

            {
                community.banner &&
                <div className="w-full h-[30vh] bg-grey">
                    <img src={community.banner} className="w-full h-full object-cover pointer-events-none" />
                </div>
            }

            <div className="p-8">
                <div className="flex items-start gap-10">
                    <div className="flex flex-col gap-4 items-center min-w-[100px]">
                        <img src={community.image} className="w-[100px] !flex-none aspect-square rounded-full" />
                        <button onClick={() => setMembersPanel(prev => !prev)} className="tag flex gap-1"><i className="fi fi-rr-user mr-2" /> <p>{community.membersCount}</p></button>
                    </div>
                    <div className="w-full">
                        <h4 className="text-3xl font-bold">{community.name}</h4>
                        <p className="mt-1">{community.des}</p>

                        {/* expanded info */}
                        <div className=" mt-5 pt-5 border-t border-grey w-full flex flex-col gap-2">
                            <p className="capitalize text-xl">Community Interests - <span className="font-bold">{community.interests.join(' , ')}</span></p>
                            <div className="flex gap-4 flex-wrap">
                                Created on {getFullDay(community.createdAt)} by 
                                <div className="flex gap-1 items-center">
                                    <img src={community.admin.personal_info.profile_img} className="w-4 h-4 rounded-full" />
                                    <Link className="underline" to={`/user/${community.admin.personal_info.username}`}>@{community.admin.personal_info.username}</Link>
                                </div> 
                            </div>
                        </div>

                        {
                            (joined != null && username != community.admin.personal_info.username) && <button className="btn-dark mt-8 py-2 px-7 bg-white text-black border border-black hover:text-white hover:bg-black" onClick={handleJoinOrLeave}>{ joined ? "Leave" : "Join" }</button>
                        }

                        {
                            username == community.admin.personal_info.username && 
                            <button className="btn-dark mt-8 py-2 px-7 bg-white text-red border border-red hover:text-white hover:bg-red" onClick={() => { setCommunityDeleteWindow(true) }}>Delete Community</button>
                        }

                    </div>
                </div>
                
            </div>

            {
                membersPanel &&
                <div className="px-8 pt-6 border-t border-grey">
                    <p className="mb-5">Community Members</p>

                    {
                        members ?
                        members.length ?
                        
                            members.map((member) => {
                                return <div className="flex gap-2 items-center" key={member.personal_info.username}>
                                        <UserCard user={member} />
                                        {
                                            member.personal_info.username == community.admin.personal_info.username && <span className="tag py-1 px-5 -mt-4">Admin</span>
                                        }
                                        {
                                            (username == community.admin.personal_info.username && member.personal_info.username != community.admin.personal_info.username) && <button className="btn-dark bg-red py-1 px-5 text-[#fff]" onClick={() => { setKickConfirmation(member) }}>Kick User</button>
                                        }
                                    </div>
                            })

                        : <NoDataMessage message={"Seems like there is no member or the system encountered any issue while getting members list."} />
                        : <Loader />
                    }

                </div>
            }

            {
                !membersPanel && 
                <div className="p-5 pt-12 mx-4 border-t border-grey">
                
                    {
                        joined && // render text and image posts fields
                        <div className="max-w-[800px] mb-5 w-full mx-auto">
                            <h4 className="text-xl font-medium mb-6">Post something </h4>
                            <div>
                                {
                                    postImage &&
                                    <div className="relative max-w-[500px] border border-grey p-4">
                                        <button onClick={() => { setPostImage(null); postImageInp.current.value = "" }} className="w-10 h-10 absolute -top-5 -right-5 flex items-center justify-center text-black border border-black bg-white rounded-full"><i className="fi fi-rr-trash text-xl" /></button>
                                        <img src={URL.createObjectURL(postImage)} className="max-w-[500px] max-h-[400px] object-contain rounded-md" />
                                    </div>
                                }
                                <textarea ref={textareaRef} name="post" className="input-box pt-3 h-20 lg:h-20 bg-none border-grey resize-none leading-7 mt-5 pl-4" placeholder="What's on your mind..."></textarea>
                                <div className="flex gap-3 items-center mt-3">
                                    <button onClick={createPost} className="btn-dark">Post</button>
                                    <div>
                                        <label htmlFor="post-image" className="btn-light border border-black bg-white">Upload Image</label>
                                        <input ref={postImageInp} onChange={handleImagePreview} id="post-image" type="file" hidden accept=".jpeg, .png, .jpg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    <div className={"p-4 flex flex-col items-center gap-5 max-w-[800px] w-full mx-auto " + (!joined ? " -mt-8 " : "")}>
                        {
                            posts == null ? <Loader />
                            :
                            posts.results ? 
                                posts.results.length ? 
                                    <>
                                    {posts.results.map((post) => {

                                        return <PostComponent key={post._id} setLoading={setLoading} setPosts={setPosts} post={post} loggedInUsername={username} adminUsername={community.admin.personal_info.username} access_token={access_token} setKickConfirmation={setKickConfirmation} />

                                    })}

                                    <LoadMoreDataBtn state={posts} fetchDataFun={fetchPosts} additionalParam={{ deletedDocCount: posts.deletedDocCount }} />

                                    </>
                                : <NoDataMessage message={"This community has no posts."} />
                            : <NoDataMessage message={"Facing some issue whiel fetching posts"} />
                        }
                    </div>

                </div>
            }

        </div>
    )
}

const PostComponent = ({ post, loggedInUsername, adminUsername, setLoading, setPosts, access_token, setKickConfirmation }) => {

    const [expanded, setExpanded] = useState(false);
    const [deleteWindow, setDeleteWindow] = useState(false);

    const { text, image, post_by: { personal_info: { username, profile_img }, _id: post_by_user_id }, _id, createdAt } = post;

    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = useRef(null);

    // Detect if the text overflows (needs "Read more")
    useEffect(() => {
        if (textRef.current) {
        const el = textRef.current;
        setIsOverflowing(el.scrollHeight > el.clientHeight + 2); // +2 for rounding
        }
    }, [text]);

    const handleDelete = () => {
        
        setDeleteWindow(false);
        
        if(username != loggedInUsername && loggedInUsername != adminUsername){ return }
        
        setLoading(true);
        // delete post manually

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-post", { id: _id }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            setPosts(currentPosts => {

                const localPosts = { ...currentPosts };

                const localResults = [...localPosts.results];
                const filteredResults = localResults.filter(item => item._id != _id);
                
                return {
                    ...localPosts,
                    results: filteredResults,
                    totalDocs: localPosts.totalDocs - 1,
                    deletedDocCount: localPosts.deletedDocCount + 1
                }

            })

            setLoading(false);
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
            toast.error("Failed to delete this post.")
        })

    }

    const linkify = (inputText) => {
        if (!inputText) return "";

        const urlRegex =
            /\b((?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;

        // Split text into parts and wrap links
        return inputText.split(urlRegex).map((part, i) => {
            if (part.match(urlRegex)) {
                // Ensure href has protocol (http/https)
                let href = part;
                if (!href.startsWith("http")) {
                    href = "https://" + href;
                }

                return (
                    <a
                        key={i}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple underline"
                    >
                        {part}
                    </a>
                );
            }

            return part;
        });
    };

    const displayText = expanded ? text : text.substring(0, 250);

    return (
        <>
        {
            deleteWindow && 
            <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/10 flex items-center justify-center">
                <div className="bg-white p-6 px-8 rounded-md max-w-[350px] w-[95%]">
                    <h4 className="text-xl font-medium">Are you sure?</h4>
                    <p className="mt-7 mb-12">Do you want to delete this post.</p>
                    <div className="flex items-center gap-3">
                        <button className="btn-light bg-none hover:bg-grey" onClick={() => { setDeleteWindow(false) }}>Cancel</button>
                        <button className="btn-dark bg-red text-[#fff]" onClick={handleDelete}>Delete</button>
                    </div>
                </div>
            </div>
        }
        <div className="p-4 px-6 border border-black/5 rounded-lg w-full">

            <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center mb-5">
                    <Link to={`/user/${username}`}><img src={profile_img} className="w-5 h-5 rounded-full" /></Link>
                    <Link to={`/user/${username}`} className="underline">@{username}</Link>
                    <p className="opacity-50">posted on {getFullDay(createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                    {
                        (username == loggedInUsername || loggedInUsername == adminUsername) &&
                        <button className="text-red underline" onClick={() => { setDeleteWindow(true) }}>Delete</button>
                    }
                    {
                        (loggedInUsername == adminUsername && username != adminUsername) &&
                        <button className="text-red underline" onClick={() => { setKickConfirmation({ personal_info: { username }, _id: post_by_user_id }) }}>Kick User</button>
                    }
                </div>
            </div>

            {
                text.length ?
                
                <>
                    <p
                        ref={textRef}
                        className={`text-xl leading-8 whitespace-pre-wrap break-words transition-all duration-300 ${
                        expanded ? "line-clamp-none" : "line-clamp-3"
                        }`}
                    >
                        {linkify(text)}
                    </p>

                    {!expanded && isOverflowing && (
                        <button
                        onClick={() => setExpanded(true)}
                        className="underline inline-block mt-2"
                        >
                        Read more
                        </button>
                    )}


                    {expanded && (
                        <button
                        onClick={() => setExpanded(false)}
                        className="underline inline-block mt-2"
                        >
                        Read less
                        </button>
                    )}
                </>
                : ""
            }

            {
                image.length ?
                <img className="rounded-md w-full" src={image} />
                : ""
            }

        </div>
        </>
    )
}

export default CommunityPage