import { useContext, useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";

const UserAuthForm = ({ type }) => {

    let { userAuth: { access_token, super_admin }, setUserAuth } = useContext(UserContext)
    const [pageState, setPageState] = useState(0); // 0 - intial details like name, email, age, gender; 1 - interests; 2 - payment
    const [interests, setInterests] = useState([]);
    const [today, setToday] = useState(new Date().toISOString().split("T")[0]);

    const [categories, setCategories] = useState([]);

    useEffect(() => {

        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/top-categories?limit=20")
        .then(res => {
            setCategories(res.data.categories)
        })
        .catch(err => console.log(err))

    }, [])

    const userAuthThroughServer = (serverRoute, formData) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
        .then(({ data }) => {
            storeInSession("user", JSON.stringify(data))
            
            setUserAuth(data)
        })
        .catch(({ response }) => {
            toast.error(response.data.error)
        })

    }

    const handleSubmit = (e) => {

        e.preventDefault();

        let serverRoute = type == "sign-in" ? "/signin" : "/signup";

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

        // formData
        let form = new FormData(formElement);
        let formData = {};

        for(let [key, value] of form.entries()){
            formData[key] = value;
        }

        let { fullname, email, password, age, gender } = formData;
        // form validation

        if(fullname){
            if(fullname.length < 3){
                toast.error("Fullname must be at least 3 letters long")
                return false; 
           }
        }
       if(!email.length){
            toast.error("Enter Email" )
            return false; 
       }
       if(!emailRegex.test(email)){
            toast.error("Email is invalid" )
            return false; 
       }
       if(!passwordRegex.test(password)){
            toast.error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters")
            return false; 
       }



       if(age != undefined){
        
            if(!age.length){
                toast.error("Provide birthdate");
                return false;
            }
            
            const birthdate = new Date(age);
            const today = new Date();

            if(birthdate > today){
                toast.error("Invalid birthdate");
                return false;
            }

            // Calculate age
            const ageInNumber = today.getFullYear() - birthdate.getFullYear();
            const monthDiff = today.getMonth() - birthdate.getMonth();
            const dayDiff = today.getDate() - birthdate.getDate();

            // Adjust age if birthday hasn't occurred yet this year
            const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? ageInNumber - 1 : ageInNumber;

            // Example validation: must be at least 13 years old
            if (actualAge < 13) {
                toast.error("You must be at least 13 to use this site");
                return false;
            }

       }

       if(gender != undefined){
            if(!gender.length){
                toast.error("Plese select the gender");
                return false;
            }
       }

       if(type == "sign-up"){
            formData.interests = interests;
       }
       
       if(e.stopLogin){ return true }

       userAuthThroughServer(serverRoute, formData)

    }

    // const handleGoogleAuth = (e) => {

    //     e.preventDefault();

    //     authWithGoogle().then(user => {
            
    //         let serverRoute = "/google-auth";

    //         let formData = {
    //             access_token: user.accessToken
    //         }

    //         userAuthThroughServer(serverRoute, formData)

    //     })
    //     .catch(err => {
    //         toast.error('trouble login through google');
    //         return console.log(err)
    //     })

    // }

    const steptwo = (e) => {
        
        e.preventDefault(); // prevent form 
        
        e.stopLogin = true; // custom key to stop login but do validaitons

        const valid = handleSubmit(e);

        if(valid){
            setPageState(1); // asks for interest;
        }

    }

    const stepthree = (e) => {
        e.preventDefault();

        // check interests
        console.log(interests);
        if(!interests.length){
            return toast.error("Please choose at least 1 interest.")
        }

        setPageState(2);
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
    
    const handleFinalStep = (e) => {
        e.preventDefault();

        // validate payment fields
        let form = new FormData(formElement);
        let formData = {};

        const today = new Date();

        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        for(let [key, value] of form.entries()){
            formData[key] = value;
        }

        let { billingName, card, month, year, secret } = formData;

        if(!billingName.length){
            return toast.error("Enter the name on your card");
        }

        if(card.length != 16){
            return toast.error("Card number is invalid. " + card.length + " Digits entered ")
        }

        if(!month){
            return toast.error("Enter card expiry month")
        } else if(month < 0 || month > 12){
            return toast.error("Expiry month is invalid")
        }

        if(!year){
            return toast.error("Enter card expiry year");
        } else if (year < currentYear || year > 2050){
            return toast.error("Expiry Year is invalid")
        }

        if(month && year && month <= currentMonth && year == currentYear){
            return toast.error("Card is expired");
        }

        if(secret.length != 3){
            return toast.error("Enter Card Secret/CVV")
        }

        // submit the form
        handleSubmit(e);
    }

    return (
        access_token ?
        super_admin ? <Navigate to={"/dashboard/super-admin/metrics"} /> : <Navigate to="/home" />
        :
        <AnimationWrapper keyValue={type}>
            <section className="h-cover flex items-center justify-center">

                <form id="formElement" className="w-[80%] max-w-[400px] relative">
                    <h1 className="text-4xl font-gelasio capitalize text-center mb-12">
                        {type == "sign-in" ? "Welcome back" : "Join us today" }
                    </h1>

                    <div className={ pageState != 0 ? "opacity-0 pointer-events-none  h-0" : "" }>
                        {
                        (type != "sign-in" ) ?
                        <InputBox
                            name="fullname"
                            type="text"
                            placeholder="Full Name"
                            icon="fi-rr-user"
                        />
                        : ""
                    }

                    <InputBox
                        name="email"
                        type="email"
                        placeholder="Email"
                        icon="fi-rr-envelope"
                    />

                    <InputBox
                        name="password"
                        type="password"
                        placeholder="Password"
                        icon="fi-rr-key"
                    />

                    {
                        type == "sign-up" &&
                        <>
                            <InputBox 
                        name="age"
                        type="date"
                        min="1980-01-01" 
                        max={today} 
                        icon="fi-rr-cake-birthday"
                    />

                    <select
                    name="gender"
                    className="w-full appearance-none rounded-md p-4 bg-grey border border-grey focus:bg-transparent placeholder:text-black"
                    >
                        <option value="">Select gender</option>
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="other">Other</option>
                    </select>
                        </>
                    }

                    </div>

                    <div className={ pageState == 1 ? "opacity-1 pointer-events-auto": "opacity-0 pointer-events-none h-0" }>
                        
                        <div >

                            <p className="mb-3 pb-4 text-center">Select one or more interest to help us build a suitable feed for you</p>
                            <div className=" mt-6 flex gap-3 flex-wrap max-w-full justify-center">
                            
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

                    </div>

                    <div className={ pageState == 2 ? "opacity-1 pointer-events-auto": "opacity-0 pointer-events-none h-0" }>

                        <div >

                            <p className="mb-3 pb-4 text-center">Provide payment information to complete subscription</p>

                            <div className="mb-4 p-3 px-8 flex gap-10 items-center border-black border bg-black text-white rounded-md">
                                <p>You will be charge this amount monthly until you cancel the membership.</p>
                                <div className="flex flex-col items-end">
                                    <h2>$5</h2>
                                    <p className="whitespace-nowrap">Premium Plan</p>
                                </div>
                            </div>

                            <InputBox
                                name="billingName"
                                type="text"
                                placeholder="Name on card"
                                icon="fi-rr-user"
                            />

                            <InputBox
                                name="card"
                                type="number"
                                min={0}
                                max={9999999999999999}
                                placeholder="Card - 2233 44XX XXXX"
                                icon="fi-rr-credit-card"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <InputBox
                                    name="month"
                                    type="number"
                                    min={1}
                                    max={12}
                                    placeholder="Month"
                                    icon="fi-rr-calendar-day"
                                />
                                <InputBox
                                    name="year"
                                    min={2025}
                                    max={2100}
                                    type="number"
                                    placeholder="Year"
                                    icon="fi-rr-calendar-day"
                                />
                            </div>

                            <InputBox
                                name="secret"
                                type="number"
                                min={100}
                                max={999}
                                placeholder="Secret - 123"
                                icon="fi-rr-credit-card"
                            />

                        </div>

                    </div>

                    {
                        type !== "sign-up" &&
                        <button
                            className="btn-dark center mt-14"
                            type="submit"
                            onClick={handleSubmit}
                        >   
                            { type.replace("-", " ") }
                        </button>
                    }

                    {
                        type == "sign-up" 
                        && 
                        <button
                            className="btn-dark center mt-14"
                            type="submit"
                            onClick={pageState == 0 ? steptwo : pageState == 1 ? stepthree : handleFinalStep}
                        >   
                            continue
                        </button>
                    }

                    {

                        type == "sign-in" ?
                        <p className="mt-6 text-dark-grey text-xl text-center">
                        Don't have an account ?
                        <Link to="/signup" className="underline text-black text-xl ml-1" >
                            Join us today
                        </Link>  
                        </p>
                        :
                        <p className="mt-6 text-dark-grey text-xl text-center">
                        Already a member ?
                        <Link to="/signin" className="underline text-black text-xl ml-1" >
                            Sign in here.
                        </Link>  
                        </p>

                    }

                    {/* <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                        <hr className="w-1/2 border-black" />
                        <p>or</p>
                        <hr className="w-1/2 border-black" />
                    </div>

                    <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
                        onClick={handleGoogleAuth}
                    >
                        <img src={googleIcon} className="w-5" />
                        continue with google
                    </button>

                     */}

                </form>
            </section>
        </AnimationWrapper>
    )
}

export default UserAuthForm;