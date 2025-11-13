import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../../App";
import { filterPaginationData } from "../../common/filter-pagination-data";
import Loader from "../../components/loader.component";
import AnimationWrapper from "../../common/page-animation";
import { nanoid } from "nanoid";
import NoDataMessage from "../../components/nodata.component";
import CategoryCard from "../../components/category-card.component";
import LoadMoreDataBtn from "../../components/load-more.component";

const CategoriesManagement = () => {

    let { userAuth, userAuth: { access_token, new_notification_available }, setUserAuth } = useContext(UserContext)

    const [ categories, setCategories ] = useState(null);

    const newCategoryInputRef = useRef(null)

    const fetchCategories = ({ page, deletedDocCount = 0 }) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/super-admin/categories", { page, deletedDocCount }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(async ({ data: { categories: data } }) => {

            if(new_notification_available){
                setUserAuth({ ...userAuth, new_notification_available: false })
            }

            let formatedData = await filterPaginationData({
                state: categories,
                data, page,
                countRoute: "/all-categories-count",
                data_to_send: { },
                user: access_token
            })

            setCategories(formatedData)

        })
        .catch(err => {
            console.log(err);
        })

    }

    useEffect(() => {
    
            if(access_token){
                fetchCategories({ page: 1 })
            }
    
    }, [access_token])

    const addCategory = () => {
        
        if(!newCategoryInputRef.current){ return }

        const val = newCategoryInputRef.current.value;

        if(!val.trim().length){ return }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/super-admin/add-categoy", { category: val.toLowerCase() }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then((res) => {

            setCategories(currentCategory => {

                const newState = { ...currentCategory };

                const results = [{ _id: res.data.category._id, name: val, blog_count: 0 } , ...newState.results];

                return {
                    ...newState, results, totalDocs: newState.totalDocs + 1
                }

            })

            newCategoryInputRef.current.value = "";

        })
        .catch(err => {
            console.log(err);
            if(err.response.data.error == "category already exists"){
                toast.error("Category already exists")
            } else {
                toast.error("Failed to process your request.")
            }
        })

    }

    return (
        <div className="pb-20">

            <div className="w-full py-3 bg-white sticky top-[80px] z-10">
                <h1 className="max-md:hidden">Manage Categories</h1>
            </div>

            {/* <Toaster /> */}

            <div className=" flex gap-4 items-center max-md:pt-5 md:pt-8 mb-10 border-b border-grey pb-10 sticky top-[100px] bg-white">
                <input 
                    type="search"
                    className="w-[50%] bg-grey p-4 pl-6 pr-6 rounded-full placeholder:text-dark-grey"
                    placeholder="Add new category"
                    ref={newCategoryInputRef}
                />
                <button className="py-4 px-8 rounded-md bg-black text-white" onClick={addCategory}>Add</button>
            </div>

            {
                categories == null ? <Loader /> :
                <>
                   {
                        categories.results.length ?
                            categories.results.map((category, i) => {

                                return <AnimationWrapper key={nanoid()} transition={{ delay: i*0.08 }}>
                                    <CategoryCard data={category} index={i} setCategories={setCategories} />
                                </AnimationWrapper>
                            })
                        : <NoDataMessage message="Nothing available" />
                   }

                   <LoadMoreDataBtn state={categories} fetchDataFun={fetchCategories} additionalParam={{ deletedDocCount: categories.deletedDocCount }} />
                    
                </>
            }


        </div>
    )
}

export default CategoriesManagement;