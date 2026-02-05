import { auth } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

export async function login(email: string, password: string) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return { user: res.user };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function register(email: string, password: string) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(res.user);
    return { user: res.user };
  } catch (err: any) {
    return { error: err.message };
  }
}
