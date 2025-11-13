import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../App";

const ReportComponent = ({ _id, username, type }) => {

    const [reportWindow, setReportWindow] = useState(false);
    const [reason, setReason] = useState("");
    const [customReasonField, setCustomReasonField] = useState(false);
    const [loading, setLoading] = useState(false);

    const customReasonInpRef = useRef(null);

    const { userAuth: { access_token } } = useContext(UserContext);

    const preDefinedReportreasons = [
        "Bad post",
        "Bad comment",
        "Spreading Hate",
        "Promoting Illegal Activities / Harmful products",
        "Abusive Behaviour",
        "Custom"
    ]

    const handleReasonSelect = (r) => {
        if(r.toLowerCase() == "custom"){ // show custom reason text box
            setReason(customReasonInpRef.current ? customReasonInpRef.current.value.toLowerCase() : "");
            setCustomReasonField(true);
        } else {
            setReason(r.toLowerCase());
            // setCustomReasonField(false);
        }
    }   

    useEffect(() => {console.log('Reason -> ', reason)}, [reason])

    const reportContent = () => {

        if(!reason.trim().length){ return }

        if(!access_token){ return toast.error("Please login first in order to report") }

        let dataToSend = { type, reason: reason.trim().toLowerCase() };

        if(type == "user"){ dataToSend.username = username }
        else { dataToSend._id = _id }

        setLoading(true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/report-content", dataToSend, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            toast.success("Reported successfully");
            setLoading(false);
            setReportWindow(false);
            setReason("");
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
            toast.error("Failed top process your request")
        })

    }

    return (
        <>
            {/* <Toaster /> */}
            {
                reportWindow &&
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white/80 z-50">
                    <div className="rounded-md p-7 bg-white max-w-[400px] w-[90%] min-w-[200px] border border-grey shadow-md">
                        <p className="text-xl font-bold">Report {type == "blog" ? "article" : type} ?</p>
                        <p className="my-4">Please provide a reason you want to report this {type == "blog" ? "article" : type}</p>
                        {
                            preDefinedReportreasons.map((r, i) => {
                                return (
                                    <div key={i} className="mb-2">
                                        <input type="radio" name="reason" id={`reason-${i+1}`} onClick={() => { handleReasonSelect(r) }}/>
                                        <label className="ml-2 " htmlFor={`reason-${i+1}`}>{r}</label>
                                    </div>
                                )
                            })
                        }

                        {
                            customReasonField &&
                            <textarea ref={customReasonInpRef} className="w-full h-[60px] resize-none border border-grey placeholder:font-inter p-2 bg-grey text-black mt-3" placeholder="Custom reason" onChange={(e) => setReason(e.target.value.toLowerCase())}></textarea>
                        }

                        <div className="flex flex-wrap gap-3 justify-end mt-8">
                        {
                            loading ?
                                <button disabled className="px-4 py-2 bg-disabled rounded-md text-[#fff]" >Reporting...</button>
                            :
                            <>
                                <button className="px-4 py-2 bg-black/10 rounded-md" onClick={() => setReportWindow(false)}>Cancel</button>
                                <button className="px-4 py-2 bg-red rounded-md text-[#fff]" onClick={reportContent}>Report</button>
                            </>
                        }   
                        </div>
                        
                    </div>
                </div>
            }

            <button className="py-2 underline text-black inline w-fit hover:text-purple" onClick={() => setReportWindow(true)}>Report {type == "blog" ? "article" : type}</button>
        </>
    )
}

export default ReportComponent;