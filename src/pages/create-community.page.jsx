import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputBox from "../components/input.component";
import Loader from "../components/loader.component";
import toast from "react-hot-toast";
import axios from "axios";
import { uploadImage } from "../common/aws";
import { UserContext } from "../App";

const CreateCommunityForm = () => {

    const { userAuth: { access_token } } = useContext(UserContext);
    
    const desLimit = 250;

    const navigate = useNavigate();

    const formRef = useRef();
    let communityImgEle = useRef();
    let bannerUploadEle = useRef();

    const [loading, setLoading] = useState(false);
    const [charactersLeft, setCharctersLeft] = useState(desLimit);
    const [communityImage, setCommunityImage] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);
    const [interests, setInterests] = useState([]);

    const [categories, setCategories] = useState([]);

    useEffect(() => {

        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/top-categories?limit=200")
        .then(res => {
            setCategories(res.data.categories)
        })
        .catch(err => console.log(err))

    }, [])


    const handleSubmit = async (e) => {
        e.preventDefault();

        // extract name and descripton from form
        let form = new FormData(formRef.current);
        let formData = { };

        for(let [key, value] of form.entries()){
            formData[key] = value;
        }

        let { name, des } = formData;

        // validate name, des and community img

        if(name.length < 3){
            return toast.error("Enter community name. It should be at least 3 characters long")
        }

        if(!des.length || desLimit > desLimit){
            return toast.error("Please write a short description about this community under " + desLimit + " characters")
        }

        if(!communityImage){
            return toast.error("Provide community image to continue.")
        }
        
        if(!interests.length){
            return toast.error("Select at least 1 interest that this community focuses.")
        }

        setLoading(true);

        // upload community img
        
        const communityImageUrl = await uploadImage(communityImage);
        
        // upload banner img if selected
        let bannerImageUrl = "";

        if(bannerImage){ bannerImageUrl = await uploadImage(bannerImage) }

        // save community with community img url

        const dataToSend = { name, des, image: communityImageUrl, banner: bannerImageUrl, interests };

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-community", dataToSend, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(res => {
            setLoading(false);
            navigate(`/communities/${res.data.id}`)
        })
        .catch(err => {
            setLoading(false);
            console.log(err)
        })

    }

    const handleCharacterChange = (e) => {
        setCharctersLeft(desLimit - e.target.value.length)
    }

    const handleImagePreview = (e) => {
        let img = e.target.files[0];
        
        communityImgEle.current.src = URL.createObjectURL(img);

        setCommunityImage(img);
    }

    const handleBannerUpload = (e) => {
        let img = e.target.files[0];
        setBannerImage(img);
    }

    const clearBanner = () => {

        setBannerImage(null)

        if(bannerUploadEle.current){

            bannerUploadEle.current.value = "";

        }
    }

    const toggleInterst = (name) => {
        
        const action = interests.includes(name) ? "remove" : "add";

        if(action == "add"){
            setInterests(cat => [...cat, name]); // cat-> category
        }
        else if(action == "remove"){
            setInterests(cat => {
                let newCat = cat.filter(item  => item != name);
                return newCat;
            })
        }

    }
    

    return (
        <section className="pt-10 relative py-16">

            { loading && <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white/75 z-30"><Loader /></div> }
            
            <Link to={"/communities"} className=" text-xl mt-2 mb-10 py-3 px-4 bg-grey/50 w-fit flex items-center gap-4">
                <i className="fi fi-rr-arrow-left" />
                Go to communities
            </Link>
            
            <h1 className="text-2xl">Create a community</h1>
            <p className="my-5 text-xl">Fill the form below to create a community.</p>

            <form ref={formRef} onSubmit={handleSubmit} className="mt-10">

                <label htmlFor="uploadImg" id="profileImgLable"
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden">
                    <div className={"w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/20 hover:opacity-100 cursor-pointer " + (communityImage ? "opacity-0" : "")}>
                        Upload Image
                    </div>
                    <img ref={communityImgEle} className="" />
                </label>

                <input type="file" id="uploadImg" accept=".jpeg, .png, .jpg" hidden onChange={handleImagePreview} />

                <p className="mt-2 mb-6">Upload a profile image for this community</p>

                <InputBox 
                    name={"name"}
                    placeholder={"Community Name"}
                    type={"text"}
                    noIcon={true}
                    className={"pl-6"}
                />

                <textarea name="des" maxLength={desLimit} className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5" placeholder="Description" onChange={handleCharacterChange}></textarea>

                <p className="mt-1 text-dark-grey mb-10">{ charactersLeft } characters left</p>
                
                <div className="flex gap-5 items-center max-md:flex-cols">
                    <label htmlFor="bannerImg" id="bannerImgLabel"
                    className="relative inline-block mb-5 py-3 px-6 bg-grey ">
                        Upload Banner
                    </label>
                    {
                        bannerImage &&
                        <div className="flex gap-3 items-center">
                            <button className="w-5 h-5 rounded-full" onClick={clearBanner}><i className="fi fi-rr-x !text-sm" /></button>
                            <p className="line-clamp-1">{bannerImage.name}</p>
                        </div>
                    }
                    <input type="file" id="bannerImg" ref={bannerUploadEle} accept=".jpeg, .png, .jpg" hidden onChange={handleBannerUpload} />
                </div>
                <p>Upload Community Banner (Optional)</p>

                        
                <div className="mt-6 pt-6 border-t border-grey">

                    <h4 className="text-2xl mb-2">Community Interests</h4>
                    <p className="mb-4">Select one or more interest this community serves. It will help in searching this community as well.</p>
                    <div className=" mt-6 flex gap-3 flex-wrap max-w-full">
                    
                        {
                            categories.map((category, i) => {
                                return <button onClick={(e) => { e.preventDefault(); toggleInterst(category.name) }} className={"tag " + (interests.includes(category.name) ? " bg-black text-white " : "")} 
                                key={i}>
                                    {category.name}
                                </button>
                            })
                        }

                    </div>

                </div>

                <button className="btn-dark rounded-md mt-14">Create Community</button>
                
            </form>
            
        </section>
    )
}

export default CreateCommunityForm;