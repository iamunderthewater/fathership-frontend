import { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { getFullTime } from "../common/date";
import { capitalize } from "../common/capitalize";
import axios from "axios";
import toast from "react-hot-toast";
import { uploadImage } from "../common/aws";

const ReportCard = ({ data, index, setData }) => {

    const { reported_by, user, createdAt, type, reason, content, link, _id } = data;
    const { userAuth: { username: loggedInUsername, access_token } } = useContext(UserContext);

    const [rejectWindow, setRejectWindow] = useState(false);
    const [warnUserWindow, setWarnUserWindow] = useState(false);
    const [banUserWindow, setBanUserWindow] = useState(false);
    const [deleteWindow, setDeleteWindow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [warnImg, setWarnImg] = useState(null);
    const [delImg, setDelImg] = useState(null);
    
    const warnImgRef = useRef(null);
    const delImgRef = useRef(null);

    const noteInpRef = useRef(null);
    const deleteInpRef = useRef(null);
    const warnCheckbox = useRef(null);

    const handleRejectReport = () => {

        setLoading(true);
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/super-admin/reject-report", { _id }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            setLoading(false);
            removeThisItemFromList();
            toast.success("Report rejected")
        })
        .catch(err => {
            setLoading(false);
            console.log(err);
            toast.error("Failed to process your request.")
        })

    }

    const handleUserwarning = async () => {
        if(!noteInpRef.current){ return }
        
        let val = noteInpRef.current.value.trim().toLowerCase();

        if(!val.length){ return }

        setLoading(true);

        const dataToSend = { _id: user._id, note: val, report_id: _id };

        let imgUrl = null;

        if(warnImg){
            imgUrl = await uploadImage(warnImg)
        }

        if(imgUrl){ dataToSend.img = imgUrl }

        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/super-admin/warn-user", dataToSend, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            setLoading(false);
            toast.success("User has been warned.")
            removeThisItemFromList();
        })
        .catch(err => {
            setLoading(false);
            console.log(err);
            toast.error("Failed to process your request.")
        })
    }

    const removeThisItemFromList = () => {
        setData(currentData => {

            let newData = {...currentData};
            let results = [...newData.results];

            results.splice(index, 1);

            return {
                ...newData, results, totalDocs: newData.totalDocs - 1,deletedDocCount: (newData.deletedDocCount ? newData.deletedDocCount + 1 : 1)
            }

        })
    }

    const handleBanUser = () => {
        setLoading(true);
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/super-admin/ban-user", { _id: user._id }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            setLoading(false);
            toast.success("User banned");
            location.reload();
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
            toast.error("Failed to process your request");
        })
    }

    const handleDelete = async () => {
        
        if(!deleteInpRef.current || !warnCheckbox.current){ return }

        const val = deleteInpRef.current.value.trim().toLowerCase();
        const toWarn = warnCheckbox.current.checked;

        if(!val.length){ return }

        let imgUrl = null;

        if(delImg){
            imgUrl = await uploadImage(delImg)
        }

        let route = type == "comment" ? "/delete-comment" : "/delete-blog";
        let dataToSend = type == "comment" ? { _id: data.ref } : { blog_id: link }

        dataToSend = {
            ...dataToSend,
            reason: val,
            toWarn,
            report_id: _id
        }

        if(imgUrl){ dataToSend.img = imgUrl }

        setLoading(true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + route, dataToSend, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            
            setLoading(false);
            toast.success(`${type} deleted`);
            location.reload();

        })
        .catch(err => {
            console.log(err);
            toast.error("Failed to process yout request");
            setLoading(false);
        })

    }

    const handleWarnImgChange = (e) => {
        const files = e.target.files;
        
        if(files.length == 1){
            
            if(!warnImg){
                setWarnImg(files[0])
                return 
            }

            if(warnImg.name != files[0].name){
                setWarnImg(files[0])
            }
        }
    }

    const handleDelImgChange = (e) => {
        const files = e.target.files;
        
        if(files.length == 1){
            
            if(!delImg){
                setDelImg(files[0])
                return 
            }

            if(delImg.name != files[0].name){
                setDelImg(files[0])
            }
        }
    }

    return (
        <>

        {
            rejectWindow &&
            <PopupContainer loading={loading} action={"Reject"} actionFunc={handleRejectReport} setWindow={setRejectWindow}>
                <p className="my-4">Do you want to reject this report. By rejecting this report you agree that this report was false. Thus no content or user will be warned.</p>

            </PopupContainer>
        }

        {
            warnUserWindow && 
            <PopupContainer action={"Warn"} actionFunc={handleUserwarning} setWindow={setWarnUserWindow} loading={loading}>
                <p className="my-4">Do you want to warn the user for their activity this time. Warning them will alert the user one time that they have been warned and will not remove any content of theirs</p>
                <textarea ref={noteInpRef} className="w-full h-[60px] resize-none border border-grey placeholder:font-inter p-2 bg-grey text-black" placeholder="Notice for user"></textarea>
                <label htmlFor="warnProof" className="bg-grey/75 block py-2 w-fit text-center rounded-md px-4 mt-2">Upload Image</label>
                <input ref={warnImgRef} id="warnProof" onInput={handleWarnImgChange} hidden type="file" accept=".png, .jpeg, .jpg"  />

                {
                    warnImg &&
                    <div className="flex items-center gap-2 mt-2">
                        <button className="text-red pt-2"><i className="fi fi-rr-cross-small text-2xl" onClick={() => {
                            setWarnImg(null)
                            warnImgRef.current.value = ""
                        }}></i></button>
                        <p className="line-clamp-1">{warnImg.name}</p>
                    </div>
                }
            </PopupContainer>
        }

        {
            banUserWindow && 
            <PopupContainer action={"Ban"} actionFunc={handleBanUser} setWindow={setBanUserWindow} loading={loading}>
                <p className="my-4 bg-red/30 rounded-md p-3"> ‼️ Are you sure, you want to ban this user. By banning the user, user's account along with all its data such as blogs, comments and any public activity will be removed from the database. User won't be able to login and use the site either.</p>
            </PopupContainer>
        }

        {
            deleteWindow &&
            <PopupContainer action={"Delete"} actionFunc={handleDelete} setWindow={setDeleteWindow} loading={loading}>
                <p className="my-4">You are about to delete this content because of the report filed. This will only delete this content and docs that are related to this. Content publisher can use site as normal without any changes.</p>
                {""}
                <div className="flex gap-2 items-center my-3 mb-6">
                    <input ref={warnCheckbox} type="checkbox" id="warn_user" />
                    <label htmlFor="warn_user" className="select-none">Give user at fault a warning.</label>
                </div>
                <textarea ref={deleteInpRef} className="w-full h-[60px] resize-none border border-grey placeholder:font-inter p-2 bg-grey text-black" placeholder="Reason / Warning"></textarea>
                <label htmlFor="delProof" className="bg-grey/75 block py-2 w-fit text-center rounded-md px-4 mt-2">Upload Image</label>
                <input ref={delImgRef} id="delProof" onInput={handleDelImgChange} hidden type="file" accept=".png, .jpeg, .jpg"  />

                {
                    delImg &&
                    <div className="flex items-center gap-2 mt-2">
                        <button className="text-red pt-2"><i className="fi fi-rr-cross-small text-2xl" onClick={() => {
                            setDelImg(null)
                            delImgRef.current.value = ""
                        }}></i></button>
                        <p className="line-clamp-1">{delImg.name}</p>
                    </div>
                }
            </PopupContainer>
        }

        <div className={"p-6 py-10 border-b border-grey border-l-black "}>
            <div className="flex gap-4">
                <img src={reported_by.personal_info.profile_img} className="w-12 h-12 flex-none rounded-full" />
                <div className="w-full opacity-75">
                    <p>{getFullTime(createdAt)}</p>
                    {
                        reported_by.personal_info.username == loggedInUsername ?
                        <h4 className="font-medium text-base text-dark-grey">
                            You <span className="font-normal">
                                reported {type}
                            </span>
                        </h4>
                        :
                        <h4 className="font-medium text-xl text-dark-grey">
                            <span className="lg:inline-block hidden capitalize">{reported_by.personal_info.fullname}</span>
                            <Link target="_blank" to={`/user/${reported_by.personal_info.username}`} className="mx-1 text-black underline">@{reported_by.personal_info.username}</Link>
                            <span className="font-normal ml-1">
                                reported {type}
                            </span>
                        </h4>
                    }
                </div>
            </div>

            <div className=" ml-16 mt-4 w-fit p-3 bg-grey/30 border border-grey rounded-md ">
                
                <div className="flex gap-2 items-center">
                    <img src={user.personal_info.profile_img} className="w-8 h-8 flex-none rounded-full border border-black/30" />
                    <div className="w-full opacity-75">
                        
                        <h4 className="font-medium text-xl text-dark-grey">
                            <span className="lg:inline-block hidden capitalize">{user.personal_info.fullname}</span>
                            <Link target="_blank" to={`/user/${user.personal_info.username}`} className="mx-1 text-black underline">@{user.personal_info.username}</Link>
                        </h4>
                        
                    </div>
                </div>

                {
                    user.warned &&
                    <p className="mt-4 bg-yellow text-[#000]">This user has already been warned before.</p>
                }

                {
                    type == "blog" &&
                    <Link to={`/blog/${link}`} className=" block mt-4 underline" target="_blank">Blog - {capitalize(content)}</Link>
                }

                {
                    type == "comment" &&
                    <p className="mt-4 ">Comment - {capitalize(content)}</p>
                }

            </div>

            <p className="my-5 ml-16 text-xl font-medium">Reason - {capitalize(reason)}</p>

            {/* actions */}

            <div className="ml-14">
                <button className="underline px-2 mr-4" onClick={() => { setRejectWindow(true)}}>Reject Report</button>
                {
                    type !== "user" && <button className="underline px-2 text-purple" onClick={() => setDeleteWindow(true)}>Delete Content</button>
                }
                {
                    !user.warned &&
                    <button className="underline px-2 text-red" onClick={() => setWarnUserWindow(true)}>Warn user</button>
                }
                <button className="underline px-2 text-red" onClick={() => setBanUserWindow(true)}>Ban User</button>
            </div>

        </div>
        </>
    )
}

const PopupContainer = ({ children, loading, setWindow, actionFunc, action }) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white/80 z-50">
            <div className="rounded-md p-5 px-7 bg-white max-w-[350px] w-[90%]  min-w-[200px] border border-grey shadow-md">
                <p className="text-2xl font-medium">Are you sure ?</p>
                {children}
                <div className="flex flex-wrap gap-3 justify-end mt-8">
                    {
                        loading ?
                            <button disabled className="px-4 py-2 bg-disabled rounded-md text-[#fff]">{action}ing...</button>
                        :
                        <>
                            <button className="px-4 py-2 bg-black/10 rounded-md" onClick={() => setWindow(false)}>Cancel</button>
                            <button className="px-4 py-2 bg-red rounded-md text-[#fff]" onClick={actionFunc}>{action}</button>
                        </>
                    } 
                </div>
            </div>
        </div>
    )
}

export default ReportCard;