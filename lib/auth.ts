//'use server';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
//import { cookies } from "next/headers";

export const signup = async (email: string, password: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);

    const user = res.user;

    // save user in Firestore db aftering signing up
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: Date.now(),
    });
    return res;
};

export const login = async (email: string, password: string) => {
    // const cookieStore = await cookies();
    // cookieStore.set("auth", "true");
    return signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
    return signOut(auth);
};
