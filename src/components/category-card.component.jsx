import { useContext, useRef, useState } from "react";
import { capitalize } from "../common/capitalize";
import axios from "axios";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";

const CategoryCard = ({ data, index, setCategories }) => {
    
    const { _id, name, blog_count } = data;
    
    const [categoryName, setCategoryName] = useState(name);
    const [editWindow, setEditWindow] = useState(false);
    const [deleteWindow, setDeleteWindow] = useState(false);
    const [loading, setLoading] = useState(false);

    const inpRef = useRef(null);

    const { userAuth: { access_token } } = useContext(UserContext);

    const saveCategory = () => {
        if(!inpRef.current){ return }

        const val = inpRef.current.value.toLowerCase();

        if(val.length){
            setLoading(true);
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/super-admin/update-category", { _id, name: val }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(() => {
                setLoading(false);
                setCategoryName(val);
                setEditWindow(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
                if(err.response.data.error == "this name is already present"){
                    toast.error("A category with this name already exists")
                } else {
                    toast.error("Failed to process your request.")
                }
            })
        }
    }

    const deleteCategory = () => {
        setLoading(true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/super-admin/delete-category", {_id}, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            
            toast.success("Content Deleted");

            setTimeout(() => {

                setLoading(false);
                setDeleteWindow(false);

                // manipulate the state
                setCategories((currentState) => {
                    
                    let newState = { ...currentState };

                    let results = [...newState.results];
                    
                    results.splice(index, 1)                

                    return { ...newState, results, totalDocs: newState.totalDocs - 1, deletedDocCount: (newState.deletedDocCount ? newState.deletedDocCount : 0) + 1 }

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

    return (
        <>
        {/* <Toaster /> */}
        { 
            editWindow &&
            <div className="fixed top-0 left-0 w-full h-full bg-black/5 z-60 flex items-center justify-center" >
                <div className="min-w-[250px] w-[90%] max-w-[350px] flex flex-col gap-8 bg-white p-5 px-8 rounded-md pb-8">
                    <h4>Edit - <span className="font-bold">{capitalize(String(categoryName).substring(0, 20))}</span></h4>
                    <p className="p-4 bg-yellow">⚠️ Are you sure you want to change the name of this category. By doing so you will be indirectly changing the articles owned by others. Give your desired name below to change this category name and update the articles connected to this.</p>
                    
                    <input ref={inpRef} type="text" name="category" placeholder="new category" className="w-full p-4 px-6 rounded-md bg-grey " />

                    <div className="flex flex-wrap gap-3 justify-end">
                        {
                            loading ?
                                <button disabled className="px-4 py-2 bg-disabled rounded-md text-[#fff]">Saving...</button>
                            :
                            <>
                                <button className="px-4 py-2 bg-black/10 rounded-md" onClick={() => setEditWindow(false)}>Cancel</button>
                                <button className="px-4 py-2 bg-black rounded-md text-white" onClick={saveCategory}>Save</button>
                            </>
                        }   
                    </div>
                </div>
            </div>
        }

        { 
            deleteWindow &&
            <div className="fixed top-0 left-0 w-full h-full bg-black/5 z-60 flex items-center justify-center" >
                <div className="min-w-[250px] w-[90%] max-w-[350px] flex flex-col gap-5 bg-white p-5 px-8 rounded-md pb-8">
                    <h4 className="text-2xl">Are you sure ?</h4>
                    {/* <p>Delete - <span className="font-bold">{capitalize(String(categoryName).substring(0, 20))}</span></p> */}
                    <p className="p-4 bg-red/20"> Are you sure you want to delete {categoryName}. By doing so all the articles related to this category and user activities with that articles will also be deleted</p>

                    <div className="flex flex-wrap gap-3 justify-end">
                        {
                            loading ?
                                <button disabled className="px-4 py-2 bg-disabled rounded-md text-[#fff]">Deleting...</button>
                            :
                            <>
                                <button className="px-4 py-2 bg-black/10 rounded-md" onClick={() => setDeleteWindow(false)}>Cancel</button>
                                <button className="px-4 py-2 bg-red rounded-md text-[#fff]" onClick={deleteCategory}>Delete</button>
                            </>
                        }   
                    </div> 
                </div>
            </div>
        }
        <div className={"py-5 px-6 border-b border-grey border-l-black "}>
            <div className="flex justify-between items-center gap-5">
                <div className="flex gap-2 items-center max-w-[90%] w-full">
                    <button className="text-red pt-1.5" onClick={() => setDeleteWindow(true)}><i className="fi fi-rr-cross-small text-2xl"></i></button>
                    <p className="text-xl font-medium max-w-[85%] line-clamp-1">{capitalize(categoryName)}</p>
                    <button className="ml-auto underline" onClick={() => setEditWindow(true)}>Edit</button>
                </div>
                <p className=" whitespace-nowrap">Articles - {blog_count}</p>
            </div>
        </div>
        </>
    )
}

export default CategoryCard;