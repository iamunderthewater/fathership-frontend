import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {

  apiKey: "AIzaSyC_sLhuVcs72ux6gjrOWj3pPm0fZhPv3f4",

  authDomain: "fathership-fyp.firebaseapp.com",

  projectId: "fathership-fyp",

  storageBucket: "fathership-fyp.firebasestorage.app",

  messagingSenderId: "1067353409981",

  appId: "1:1067353409981:web:81c806bb5d5b9f67602ad4"

};


const app = initializeApp(firebaseConfig);

// google auth

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {

    let user = null;

    await signInWithPopup(auth, provider)
    .then((result) => {
        user = result.user
    })
    .catch((err) => {
        console.log(err)
    })

    return user;
}