import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { useContext, useEffect, useRef, useState } from "react";
import { EditorContext } from "../pages/editor.pages";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import { capitalize } from "../common/capitalize";

const PublishForm = () => {

    let characterLimit = 200;
    // let tagLimit = 10;

    let { blog_id } = useParams();

    let { blog, blog: { banner, title, category, des, content, ageRating, targetGender }, setEditorState, setBlog, setTextEditor } = useContext(EditorContext);

    let { userAuth: { access_token } } = useContext(UserContext);

    let navigate = useNavigate();

    const [categoriesList, setCategoriesList] = useState([]);
    const [categoriesSelect, setCategoriesSelect] = useState([]);
    const [showCategories, setShowCategories] = useState(false);

    const categoryInpRef = useRef(null);

    useEffect(() => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/categories")
        .then(res => {
            setCategoriesSelect(res.data.categories)
            setCategoriesList(res.data.categories)
        })
        .catch(err => console.log(err))
    }, [])

    const handleCloseEvent = () => {
        setEditorState("editor");
        setTextEditor({ isReady: false })
    }

    const handleBlogTitleChange = (e) => {
        let input = e.target;

        setBlog({ ...blog, title: input.value })
    }

    const handleAgeRatingChange = (e) => {
        let input = e.target;

        setBlog({ ...blog, ageRating: input.value })
    }

    const handleTargetGender = (e) => {
        let input = e.target;

        setBlog({ ...blog, targetGender: input.value })
    }

    const handleBlogDesChange = (e) => {
        let input = e.target;

        setBlog({ ...blog, des: input.value })
    }

    const handleTitleKeyDown = (e) => {
        if(e.keyCode == 13) { // enter key
            e.preventDefault();
        }
    }

    // const handleKeyDown = (e) => {
    //     if(e.keyCode == 13 || e.keyCode == 188) {
    //         e.preventDefault();

    //         let tag = e.target.value;

    //         if(tags.length < tagLimit){
    //             if(!tags.includes(tag) && tag.length){
    //                 setBlog({ ...blog, tags: [ ...tags, tag ] })
    //             }
    //         } else{
    //             toast.error(`You can add max ${tagLimit} Tags`)
    //         }
            
    //         e.target.value = "";
    //     }

    // }

    const publishBlog = async (e) => {

        if(e.target.className.includes("disable")) {
            return;
        }

        const blogCategory = categoryInpRef.current.value.toLowerCase();

        if(!title.length){
            return toast.error("Write blog title before publishing")
        }

        if(!des.length || des.length > characterLimit){
            return toast.error(`Write a description about your blog withing ${characterLimit} characters to publish`)
        }

        const ageRange = ageRating || "all";
        const genderSelection = targetGender || "all";

        // AI check

        let aiCheckToast = toast.loading("Checking blog content using AI model...");

        try {
            const res = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/check-blog-content-before-publishing", { title, des, content: content.blocks }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
        
            toast.dismiss(aiCheckToast);

            const flaggedItems = res.data.result; // backend now sends array directly

            // Check if any are flagged
            const hasFlagged = flaggedItems.some((item) => item.flagged);

            if (hasFlagged) {
                const flaggedParts = flaggedItems
                        .filter((item) => item.flagged)
                        .map((item) => {
                            const header = `${item.part.toUpperCase()}: ${item.reasons
                            .map((r) => r[0].toUpperCase() + r.slice(1))
                            .join(", ") || "Unspecified"}`;

                            const snippets = (item.flagged_text || [])
                            .map(s => s.replace(/\s+/g, " ").trim()) // single-line, trimmed
                            .map(s => (s.length > 140 ? s.slice(0, 137) + "..." : s)) // limit length
                            .join("; ");

                            return snippets
                            ? `${header}\nProblematic text: "${snippets}"`
                            : header;
                        })
                        .join("\n\n");

                    toast((t) => (
                        <div className="p-4 text-sm text-gray-800 max-w-[480px] whitespace-pre-line leading-[1.6]" >
                            <p className="font-semibold mb-2 text-red">
                            AI Moderation Warning
                            </p>
                            <p>{`Your post contains disallowed content:\n\n${flaggedParts}`}</p>
                            <div className="flex justify-end mt-4">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="px-3 py-1 text-sm rounded-md btn-dark hover:bg-red-700"
                            >
                                Close
                            </button>
                            </div>
                        </div>
                        ),
                        {
                            duration: Infinity, // stays open until user closes it
                            icon: null, // no default icon
                            style: {
                                background: "#fff",
                                border: "1px solid #fca5a5",
                                boxShadow:
                                "0 4px 10px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
                                padding: 0, // handled by inner div
                            },
                        }
                    );

                return false;
            }

            toast.success("✅ Content passed AI Check!");

        } catch(err) {
            toast.dismiss(aiCheckToast);
            toast.error("Failed to perform AI checks.");
            console.error(err);
            return;
        }

        // publish

        let loadingToast = toast.loading("Publishing....");

        e.target.classList.add('disable');

        let blogObj = {
            title, banner, des, content, draft: false, category: blogCategory, ageRating: ageRange, targetGender: genderSelection
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", { ...blogObj, id: blog_id }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            
            e.target.classList.remove('disable');

            toast.dismiss(loadingToast);
            toast.success("Published 👍");

            setTimeout(() => {
                navigate("/dashboard/blogs")
            }, 500);

        })
        .catch(( { response } ) => {
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);

            return toast.error(response.data.error)
        })

    }

    const handleCategoryChange = (e) => {
        
        const val = e.target.value.toLowerCase();

        if(val.length){
            const filteredList = categoriesList.filter(item => item.startsWith(val));

            setCategoriesSelect(filteredList);
        } else {
            setCategoriesSelect(categoriesList)
        }

    }

    const handleCategoryBlur = () => {
        
        const val = categoryInpRef.current.value.toLowerCase();

        if(!categoriesList.includes(val)){
            categoryInpRef.current.value = "";
            setTimeout(() => setCategoriesSelect(categoriesList), 250)
        }

        setTimeout(() => setShowCategories(false), 200)

    }

    return (
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">

                {/* <Toaster /> */}

                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
                onClick={handleCloseEvent}
                >
                    <i className="fi fi-br-cross"></i>
                </button>

                <div className="max-w-[550px] center">
                    <p className="text-dark-grey mb-1">Preview</p>

                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4" >
                        <img src={banner} />
                    </div>

                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">{ title }</h1>

                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">{ des }</p>
                </div>

                <div className="border-grey lg:border-1 lg:pl-8">
                    <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
                    <input type="text" placeholder="Blog Title" defaultValue={title} className="input-box pl-4" onChange={handleBlogTitleChange} />

                    <p className="text-dark-grey mb-2 mt-9">Short description about your blog</p>

                    <textarea 
                        maxLength={characterLimit}
                        defaultValue={des}
                        className="h-40 resize-none leading-7 input-box pl-4"
                        onChange={handleBlogDesChange}
                        onKeyDown={handleTitleKeyDown}
                    >
                    </textarea>

                    <p className="mt-1 text-dark-grey text-sm text-right">{ characterLimit - des.length } characters left</p>

                    <div className="relative mt-2">
                        <input ref={categoryInpRef} type="text" placeholder="Blog Category" defaultValue={category ? category.name : ""} className="input-box pl-4" onFocus={() => setShowCategories(true)} onBlur={handleCategoryBlur} onChange={handleCategoryChange} />
                    
                        {
                            showCategories ?  
                            <div className="w-full max-h-[150px] overflow-auto absolute bg-white z-20 border border-grey top-[110%]">
                                {
                                    categoriesSelect.map((item, i) => {
                                        return <button key={i} className="w-full block py-2 px-5 text-left border-b border-grey"
                                        onClick={() => {
                                            categoryInpRef.current.value = item.toLowerCase();
                                        }}
                                        >{capitalize(item)}</button>
                                    })
                                }
                            </div>
                            : ""
                        }
                    </div>
                    
                    {/* <p className="text-dark-grey mb-2 mt-9">Topics - ( Helps is searching and ranking your blog post )</p>

                    <div className="relative input-box pl-2 py-2 pb-4">
                        <input type="text" placeholder="Topic" className="sticky input-box bg-white top-0 left-0  pl-4 mb-3 focus:bg-white "
                        onKeyDown={handleKeyDown}
                         />
                        
                        {   
                            tags.map((tag, i) => {
                                return <Tag tag={tag} tagIndex={i} key={i} />
                            }) 
                        }
                    </div>

                    <p className="mt-1 mb-4 text-dark-grey text-right" >{ tagLimit - tags.length } Tags left</p> */}

                    {/* blog age and gender rating */}

                    <div className="relative my-3 mt-10">
                        <p className="mb-3">Choose suitable age group this article best describes. It help us serve this article to right users</p>
                        <select
                        name="age"
                        className="w-full appearance-none rounded-md p-4 bg-grey border border-grey focus:bg-transparent placeholder:text-black"
                        onChange={handleAgeRatingChange}
                        defaultValue={ageRating ? ageRating : "all"}
                        >
                            <option value="all">All</option>
                            <option value="13-17">13-17</option>
                            <option value="18-25">18-25</option>
                            <option value="26-35">26-35</option>
                            <option value="35+">35+</option>
                        </select>
                    </div>
                    
                    <div className="relative my-3 mt-10">
                        <p className="mb-3">Choose suitable gender this article best describes. It help us serve this article to right users</p>
                    <select
                    name="gender"
                    className="w-full appearance-none rounded-md p-4 bg-grey border border-grey focus:bg-transparent placeholder:text-black"
                    onChange={handleTargetGender}
                    defaultValue={targetGender ? targetGender : "all"}
                    >
                        <option value="all">All</option>
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="other">Other</option>
                    </select>
                    </div>

                    <button className="btn-dark px-8 mt-6"
                        onClick={publishBlog}
                    >Publish</button>

                </div>

            </section>
        </AnimationWrapper>
    )
}

export default PublishForm;