import { Link } from "react-router-dom";
import { getFullTime } from "../common/date";
import { capitalize } from "../common/capitalize";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";
import { uploadImage } from "../common/aws";

const ActivityCard = ({ data, setData, index }) => {

    let { user: { personal_info: { profile_img, fullname, username } }, type, action, content, link, createdAt } = data;

    let { userAuth: { username: loggedInUsername, access_token } } = useContext(UserContext); 

    const [deleteWindow, setDeleteWindow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [proofImg, setProofImg] = useState(null);
    
    const deleteReasonRef = useRef(null);
    const proofImgRef = useRef(null);

    const handleDeleteWindow = () => {
        setDeleteWindow(true);
    }

    const deleteContent = async () => {
        if(!deleteReasonRef.current || type == "user"){ return }
        
        let reason = deleteReasonRef.current.value;

        if(!reason.trim().length){
            toast.error("Provide a reason before deleting the content.");
            return;
        }

        setLoading(true);

        const route = type == "blog" ? "/delete-blog" : "/delete-comment";
        const dataToSend = type == "blog" ? { blog_id: data.link } : { _id: data.ref };

        // upload Image and save its url
        let imgUrl = null; 

        if(proofImg && proofImg instanceof File){
            // upload the image
            imgUrl = await uploadImage(proofImg)
        }

        dataToSend["reason"] = reason;

        if(imgUrl){
            dataToSend["img"] = imgUrl;
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + route, dataToSend, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            
            toast.success("Content Deleted");

            setTimeout(() => {

                setLoading(false);
                setDeleteWindow(false);
                deleteReasonRef.current.value = "";

                // manipulate the state
                setData((currentState) => {
                    
                    let newState = { ...currentState };

                    let results = [...newState.results];
                    
                    results = results.filter((item, i) => {
                        const matchesType =
                            (type === "blog" && item.blog_ref !== data.ref && item.ref !== data.ref) ||
                            (type === "comment" && item.parent_ref !== data.ref);

                        return matchesType && i !== index;
                    });
                    
                    let DocsDeleted = newState.results.length - results.length;

                    return { ...newState, results, totalDocs: newState.totalDocs - DocsDeleted, deletedDocCount: (newState.deletedDocCount ? newState.deletedDocCount : 0) + DocsDeleted }

                })
            }, 1000)
            
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
            // setDeleteWindow(false);
            toast.error(err.response.data.error);
            return
        })
    }

    const handleFileChange = (e) => {
        const files = e.target.files;
        
        if(files.length == 1){
            
            if(!proofImg){
                setProofImg(files[0])
                return 
            }

            if(proofImg.name != files[0].name){
                setProofImg(files[0])
            }
        }
    }

    return (
        <>
        {/* <Toaster /> */}
        {
            deleteWindow &&
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white/80 z-50">
                <div className="rounded-md p-7 bg-white max-w-[500px] w-[90%] min-w-[200px] border border-grey shadow-md">
                    <p className="text-xl font-bold">Are you sure ?</p>
                    <p className="my-5">You are trying to delete the content as super admin. You may not own this content. Are sure of your action. Confirm your action by giving a reason to delete this.</p>
                    <textarea ref={deleteReasonRef} className="w-full h-[60px] resize-none border border-grey placeholder:font-inter p-2 bg-grey text-black" placeholder="Reason to remove this content"></textarea>
                    <label htmlFor="proof" className="bg-grey/75 block py-2 w-fit text-center rounded-md px-4 mt-2">Upload Image</label>
                    <input ref={proofImgRef} id="proof" onInput={handleFileChange} hidden type="file" accept=".png, .jpeg, .jpg"  />

                    {
                        proofImg &&
                        <div className="flex items-center gap-2 mt-2">
                            <button className="text-red pt-2"><i className="fi fi-rr-cross-small text-2xl" onClick={() => {
                                setProofImg(null)
                                proofImgRef.current.value = ""
                            }}></i></button>
                            <p className="line-clamp-1">{proofImg.name}</p>
                        </div>
                    }

                    <div className="flex flex-wrap gap-3 justify-end mt-2">
                        {
                            loading ?
                                <button disabled className="px-4 py-2 bg-disabled rounded-md text-[#fff]">Deleting...</button>
                            :
                            <>
                                <button className="px-4 py-2 bg-black/10 rounded-md" onClick={() => setDeleteWindow(false)}>Cancel</button>
                                <button className="px-4 py-2 bg-red rounded-md text-[#fff]" onClick={deleteContent}>Delete</button>
                            </>
                        }   
                    </div>
                    
                </div>
            </div>
        }
        <div className={"p-6 border-b border-grey border-l-black "}>
            <div className="flex gap-4">
                <img src={profile_img} className="w-12 h-12 flex-none rounded-full" />
                <div className="w-full opacity-75">
                    <p>{getFullTime(createdAt)}</p>
                    {
                        username == loggedInUsername ?
                        <h4 className="font-medium text-base text-dark-grey">
                            You <span className="font-normal">
                                {action}
                            </span>
                        </h4>
                        :
                        <h4 className="font-medium text-xl text-dark-grey">
                            <span className="lg:inline-block hidden capitalize">{fullname}</span>
                            <Link target="_blank" to={`/user/${username}`} className="mx-1 text-black underline">@{username}</Link>
                            <span className="font-normal ml-1">
                                {action}
                            </span>
                        </h4>
                    }
                </div>
            </div>
            
            <div className="ml-16">
                {
                    type != "user" ?
                    <div className="pt-3 py-1 mt-3 border-t border-grey">
                        {
                            type == "blog" ?
                                link ? 
                                    <Link target="_blank" to={`/blog/${link}`} className=" hover:underline"> {capitalize(content)}<i className="fi fi-rr-arrow-up-right-from-square ml-1 mt-.5 text-sm opacity-50"></i></Link>
                                : 
                                    <p> {capitalize(content)}</p>
                            : 
                            type != "user" ?
                            <p>{capitalize(content)}</p>
                            : ""
                        }
                    </div> :""
                }

                {
                    type != "user" && action != "deleted" ?
                    <button className="pr-4 pt-2 pb-0 underline text-red" onClick={handleDeleteWindow}>Delete {type}</button> : ""
                }
            </div>

        </div>
        </>
    )

}

export default ActivityCard;