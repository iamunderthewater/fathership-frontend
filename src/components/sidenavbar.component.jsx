import { useContext, useEffect, useRef, useState } from "react"
import { Outlet, Navigate, NavLink } from "react-router-dom"
import { UserContext } from "../App"
import PageNotFound from "../pages/404.page"

const SideNav = () => {

    let { userAuth: { access_token, new_notification_available, super_admin } } = useContext(UserContext)
    
    let page = location.pathname.split("/")[2];

    let [ pageState, setPageState ] = useState(page ? page.replace('-', ' ') : null);
    let [ showSideNav, setShowSideNav ] = useState(true);

    let activeTabLine = useRef();
    let sideBarIconTab = useRef();
    let pageStateTab = useRef();

    const changePageState = (e) => {

        let { offsetWidth, offsetLeft } = e.target;

        activeTabLine.current.style.width = offsetWidth + "px";
        activeTabLine.current.style.left = offsetLeft + "px";

        if(e.target == sideBarIconTab.current){
            setShowSideNav(true);
        } else{
            setShowSideNav(false);
        }

    }

    useEffect(() => {

        if(pageState == null){
            return <PageNotFound />
        }

        setShowSideNav(false);
        pageStateTab.current.click();
    }, [pageState])

    return (
        access_token === null ? <Navigate to="/signin" /> :
        <>
            <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">

                <div className="sticky top-[80px] z-30"> 
                    {/* mobile device links */}
                    <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto ">
                        <button ref={sideBarIconTab} className="p-5 capitalize" onClick={changePageState}>
                            <i className="fi fi-rr-bars-staggered pointer-events-none"></i>
                        </button>
                        <button ref={pageStateTab} className="p-5 capitalize" onClick={changePageState}>
                            { pageState }
                        </button>
                        <hr ref={activeTabLine} className="absolute bottom-0 duration-500" />
                    </div>

                    {/* large screen links */}
                    <div className={"min-w-[200px] h-[calc(100vh-80px-60px)] md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%+80px)] max-md:px-16 max-md:-ml-7 duration-500 " + (!showSideNav ? "max-md:opacity-0 max-md:pointer-events-none" : "opacity-100 pointer-events-auto")}>

                        <h4 className="text-xl text-dark-grey mb-3">Dashboard</h4>
                        <hr className="border-grey -ml-6 max-md:mb-2 mb-8 mr-6" />

                        <NavLink to="/dashboard/articles" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                            <i className="fi fi-rr-document"></i>
                            Articles
                        </NavLink>

                        <NavLink to="/dashboard/notifications" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                            <div className="relative">
                                <i className="fi fi-rr-bell"></i>
                                {
                                    new_notification_available ? 
                                    <span className="bg-red w-2 h-2 rounded-full absolute z-10 top-0 right-0"></span> : ""
                                }
                            </div>
                            Notifications
                        </NavLink>

                        <NavLink to="/editor" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                            <i className="fi fi-rr-file-edit"></i>
                            Write
                        </NavLink>

                        {
                            super_admin &&
                            <div>
                                <h4 className="text-lg uppercase break-words text-dark-grey mt-8 mb-3">Super Admin</h4>
                                <hr className="border-grey -ml-6 max-md:mb-2 mb-8 mr-6" />
                                

                                <NavLink to="/dashboard/super-admin/categories" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                                    <i className="fi fi-rr-book mt-1"></i>
                                    Categories
                                </NavLink>

                                <NavLink to="/dashboard/super-admin/activities" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                                    <i className="fi fi-rr-pencil mt-1"></i>
                                    Activities
                                </NavLink>

                                <NavLink to="/dashboard/super-admin/reports" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                                    <i className="fi fi-rr-circle-x mt-1"></i>
                                    Reports
                                </NavLink>

                                <NavLink to="/dashboard/super-admin/metrics" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                                    <i className="fi fi-rr-chart-pie-alt mt-1"></i>
                                    Metrics
                                </NavLink>

                            </div>
                        }

                        <h4 className="text-lg text-dark-grey uppercase max-md:mt-8 mt-20 mb-3">Settings</h4>
                        <hr className="border-grey -ml-6 max-md:mb-2 mb-8 mr-6" />

                        <NavLink to="/settings/edit-profile" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                            <i className="fi fi-rr-user"></i>
                            Edit Profile
                        </NavLink>

                        <NavLink to="/settings/change-password" onClick={(e) => setPageState(e.target.innerText)} className="sidebar-link">
                            <i className="fi fi-rr-lock"></i>
                            Change Password
                        </NavLink>

                    </div>

                </div>


                <div className="max-md:-mt-8 mt-5 w-full">
                    <Outlet />
                </div>

            </section>
        </>
    )
}

export default SideNav