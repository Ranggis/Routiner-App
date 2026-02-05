import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./config";

// make new user doc
export async function createUserDocument(uid: string, data: any) {
  return await setDoc(doc(db, "users", uid), data);
}

// get user doc
export async function getUserDocument(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}
