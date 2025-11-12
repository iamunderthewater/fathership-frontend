import { Routes, Route, Router } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNav from "./components/sidenavbar.component";
import ChangePassword from "./pages/change-password.page";
import EditProfile from "./pages/edit-profile.page";
import Notifications from "./pages/notifications.page";
import ManageBlogs from "./pages/manage-blogs.page";
import ActivitiesLog from "./pages/super-admin/activities.page";
import CategoriesManagement from "./pages/super-admin/manage-categories";
import { Toaster } from "react-hot-toast";
import ManageReports from "./pages/super-admin/reports.page";
import LandingPage from "./pages/landing.page";
import Communities from "./pages/communities.page";
import CreateCommunityForm from "./pages/create-community.page";
import CommunityPage from "./pages/communityPage.page";
import ProtectedRoute from "./components/protectedRoute.component";

export const UserContext = createContext({})

export const ThemeContext = createContext({});

export const CommunitiesContext = createContext({});

const darkThemePreference = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

const App = () => {

    const [userAuth, setUserAuth] = useState({});
    const [joinedCommunities, setJoinedCommunities] = useState(null);
    const [showSidePanel, setShowSidePanel] = useState(true); // side panel state for mobile responsive
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    const [ theme, setTheme ] = useState(() => darkThemePreference() ? "dark" : "light" );

    useEffect(() => {

        let userInSession = lookInSession("user");
        let themeInSession = lookInSession("theme");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null })
        
        if (themeInSession) {
            setTheme(() => {

                document.body.setAttribute('data-theme', themeInSession);

                return themeInSession;
            
            })
        } else {
            document.body.setAttribute('data-theme', theme)
        }

        setIsAuthChecked(true);

    }, [])

    if (!isAuthChecked) {
        // optional loading screen
        return <div className="loading">Loading...</div>;
    }


    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <UserContext.Provider value={{userAuth, setUserAuth}}>
                <CommunitiesContext.Provider value={{ joinedCommunities, setJoinedCommunities, showSidePanel, setShowSidePanel }}>
                <Toaster />
                <Routes>
                {/* Public routes */}
                <Route path="/" element={<Navbar />}>
                    <Route index element={<LandingPage />} />
                    <Route path="signin" element={<UserAuthForm type="sign-in" />} />
                    <Route path="signup" element={<UserAuthForm type="sign-up" />} />
                    <Route path="*" element={<PageNotFound />} />
                </Route>

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/editor" element={<Editor />} />
                    <Route path="/editor/:blog_id" element={<Editor />} />
                    <Route path="/" element={<Navbar />}>
                    <Route path="home" element={<HomePage />} />
                    <Route path="communities" element={<Communities />}>
                        <Route path=":community_id" element={<CommunityPage />} />
                    </Route>
                    <Route path="create-community" element={<CreateCommunityForm />} />
                    <Route path="dashboard" element={<SideNav />}>
                        <Route index element={<PageNotFound />} />
                        <Route path="blogs" element={<ManageBlogs />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="super-admin">
                        <Route index element={<PageNotFound />} />
                        <Route path="categories" element={<CategoriesManagement />} />
                        <Route path="activities" element={<ActivitiesLog />} />
                        <Route path="reports" element={<ManageReports />} />
                        </Route>
                    </Route>
                    <Route path="settings" element={<SideNav />}>
                        <Route index element={<PageNotFound />} />
                        <Route path="edit-profile" element={<EditProfile />} />
                        <Route path="change-password" element={<ChangePassword />} />
                    </Route>
                    <Route path="search/:query" element={<SearchPage />} />
                    <Route path="user/:id" element={<ProfilePage />} />
                    <Route path="blog/:blog_id" element={<BlogPage />} />
                    </Route>
                </Route>
                </Routes>

                </CommunitiesContext.Provider>
            </UserContext.Provider>
        </ThemeContext.Provider>
    );

}

export default App;