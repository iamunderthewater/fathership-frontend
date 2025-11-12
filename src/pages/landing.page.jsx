import { Link } from "react-router-dom";
import { contact_email, faqs, features_list, footer_company_short_text, home_seciton_paragraph, name, phone, plan_features_list, reviews, sign_up_paragraph, video_id } from "../data/landing-page.data";
import homeSvg from "../imgs/hero.svg";
import whySvg from "../imgs/question.svg";
import logo from "../imgs/logo-dark.png"
import lightLogo from "../imgs/logo-light.png"
import { useState } from "react";

const LandingPage = () => {
    return (
        <div className="max-w-[1800px] mx-auto">

            {/* navbar */}

            <nav className="navbar z-50">

                <Link to="/" className="flex-none flex items-center gap-4 w-10">
                    <img className="w-full" src={logo} />
                    <h1 className="text-xl max-md:hidden">{name}</h1>
                </Link>

                <div className="flex gap-3 items-center ml-auto">
                    <Link to={"/signup"} className="px-2 py-1 text-xl max-md:hidden">Sign up</Link>
                    <a href={"#why_choose_us"} className="px-2 py-1 text-xl">Why choose us</a>
                    <a href={"#faqs"} className="px-2 py-1 text-xl">FAQs</a>
                </div>

            </nav>

            {/* home page */}

            <section className="flex items-center gap-20 justify-between py-20 mb-8 max-xl:flex-col">
                <div className="lg:w-[45%] max-xl:flex flex-col items-center">
                    <h3 className=" mb-7 !text-4xl !leading-[60px] max-xl:text-center">Welcome to <span className="text-indigo-600 !text-4xl">{name}</span></h3>
                    <p className="opacity-75 leading-7 text-xl w-[90%] max-xl:text-center max-xl:max-w-[450px]">{home_seciton_paragraph}</p>
                </div>
                <img src={homeSvg} className="w-[400px]" />
            </section>

            {/* sign up link */}
            <section className="flex items-center flex-col gap-6 py-28 border-y border-purple/10">
                <h3 className="text-center !text-4xl">Sign up</h3>
                <p className="max-w-[450px] text-center text-xl leading-7">{sign_up_paragraph}</p>
                <Link to={"/signup"} className="btn-dark mt-4 px-9 pb-4 bg-indigo-600">Sign Up</Link>
            </section>

            {/* why choose us, simple features options */}

            <section id="why_choose_us" className="flex items-center flex-col gap-3 py-20">
                
                <h3 className="text-center !text-4xl">Why choose us ?</h3>

                <div className="flex max-lg:flex-col gap-10 items-center lg:items-start justify-center mt-6">
                    <div>
                    <img src={whySvg} className="max-w-[500px] w-[90%] my-7" />

                    <p className="max-w-[450px] text-center leading-7 text-xl">Wondering why you should choose us ? Here are some of the features we offer which will make your life easy. </p>
                    </div>

                    <div className="mt-12 flex flex-col gap-4 lg:w-[40%]">
                        {
                            features_list.map((item, i) => {
                                return <div key={i} className="flex gap-4 items-start text-xl">
                                        <i className="fi fi-ss-map-marker-check text-green-500 text-2xl mt-1"></i>
                                        <p className="leading-7 text-xl">{item}</p>
                                    </div>
                            })
                        }
                    </div>
                </div>

            </section>

            {/* pricing section */}
            <section className="flex items-center flex-col gap-3 py-20 -mt-10">
                
                <h4 className="text-3xl mb-14">At low price.</h4>

                    <div className="border border-gray-200 rounded-md p-6 px-8 shadow-[-10px_-10px_0_#6b62ff] max-h-[400px] min-h-[400px] min-w-[300px] max-w-[300px]">

                        <p className="text-xl mb-3">Premium Plan</p>
                        <h4 className="text-3xl font-medium">$5.00 / month</h4>

                        <div className="mt-12 flex flex-col gap-2.5">
                        {
                            plan_features_list.map((item, i) => {
                                return <div key={i} className="flex gap-2 items-start">
                                        <i className="fi fi-ss-map-marker-check text-green-500 mt-1"></i>
                                        <p className="leading-7">{item}</p>
                                    </div>
                            })
                        }

                        <Link to={"/signup"} className="btn-dark mt-4 px-9 pb-4 bg-indigo-600/10 hover:text-white hover:bg-indigo-600 text-indigo-600">Join Now</Link>
                    </div>

                    </div>

            </section>

            {/* faqs section */}
            <section id="faqs" className="flex items-center flex-col gap-4 py-20 -mt-10">

                    <h4 className="text-3xl mb-14">Frequently asked questions</h4>

                    {
                        faqs.map((item, i) => {
                            return <Faq key={i} item={item} />
                        })
                    }

            </section>

            {/* reviews */}

            <section className="flex items-center flex-col gap-3 py-20">
                <h4 className="text-3xl mb-5">Reviews</h4>
                <p className="max-w-[450px] mb-14 text-center text-xl leading-7">Read, what our community users have to say about us.</p>

                <div className="flex items-center justify-center flex-wrap gap-6 max-sm:gap-12">
                    {
                        reviews.map((review, i) => {
                            return <div key={i} className="p-5 min-w-[300px] max-w-[400px] rounded-md bg-indigo-600/10 shadow-[5px_5px_0_#6b62ff] flex flex-col gap-2">
                                        <div className="flex items-start gap-3 pb-5 border-b border-indigo-600/10">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                                <i className="fi fi-rr-user" />
                                                </div>
                                            <div>
                                                <h4>{review.name}</h4>
                                                <div className="flex gap-2 items-center">
                                                    {
                                                        Array.from({ length: review.rating }).map((star, i) => {
                                                            return <i key={i} className="fi fi-sr-star text-[#ff8500]" />
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <p className="leading-7 text-xl py-4 px-5">{review.review}</p>
                                    </div>
                        })
                    }
                </div>
                
            </section>
                    
            {/* yt video section */}

            <section className="flex items-center flex-col gap-8 py-10">

                <h3 className="text-center !text-3xl mb-5">See {name} in Action</h3>

                <iframe className="w-[90%] max-w-[650px] aspect-video" src={`https://www.youtube.com/embed/${video_id}`}title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>

            </section>
            
            {/* footer */}

            <footer className="w-full py-10 px-[5vw] mt-10 bg-black text-white flex flex-col gap-6">

                <Link to="/" className="flex-none flex items-center gap-4 w-10">
                    <img className="w-full" src={lightLogo} />
                    <h1 className="text-xl">{name}</h1>
                </Link>

                <p className="text-xl my-3">{footer_company_short_text}</p>

                <hr className="opacity-10" />

                <div className="flex gap-5 flex-wrap items-center">
                    <h4 className="font-medium text-xl">Quick Links</h4>
                    <Link to={"#"} className="opacity-50 px-2 py-1">About</Link>
                    <Link to={"#"} className="opacity-50 px-2 py-1">Careers</Link>
                    <Link to={"#"} className="opacity-50 px-2 py-1">Support</Link>
                </div>

                <hr className="opacity-10" />

                <h4 className="font-medium text-xl">Contact</h4>

                <div className="-mt-2">
                    <p>Email - {contact_email}</p>
                    <p className="mt-2 ">Phone - {phone}</p>

                </div>

                <div className="flex gap-6 items-center">
                    <Link to={"#"}><i className="fi fi-brands-instagram text-2xl" /></Link>
                    <Link to={"#"}><i className="fi fi-brands-facebook text-2xl" /></Link>
                    <Link to={"#"}><i className="fi fi-brands-twitter-alt text-2xl" /></Link>
                </div>

            </footer>


        </div>
    )
}

const Faq = ({ item }) => {

    const { question, answer } = item;

    const [active, setActive] = useState(false);

    return (
        <div className="w-full border-b border-gray-200 px-4 py-2 relative">
            <button className="text-2xl relative block w-full text-left" onClick={() => setActive(prev => !prev)}>
                {question}
                <span className={"absolute right-1 top-2 " + (active ? "rotate-180 top-1" : "")}><i className="fi fi-rr-angle-small-down " /></span>
            </button>
            {
                active &&
                <p className="mt-3 text-xl leading-8 opacity-75 mb-4">{answer}</p>
            }
        </div>
    )
}

export default LandingPage;