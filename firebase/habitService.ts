import { db, auth } from "./config";
import { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc 
} from "firebase/firestore";

// Ambil UID
const getUID = () => auth.currentUser?.uid;

// =============================
// Tambah Habit
// =============================
export async function addHabit(data: any) {
  const uid = getUID();
  if (!uid) throw new Error("User not logged in");

  const habitRef = doc(collection(db, "users", uid, "habits"));
  const payload = {
    id: habitRef.id,
    ...data,
    createdAt: Date.now(),
  };

  await setDoc(habitRef, payload);
  return payload;
}

// =============================
// Ambil Semua Habit
// =============================
export async function getAllHabits() {
  const uid = getUID();
  if (!uid) return [];

  const snap = await getDocs(collection(db, "users", uid, "habits"));
  return snap.docs.map((d) => d.data());
}

// =============================
// Ambil Detail Habit
// =============================
export async function getHabitById(habitId: string) {
  const uid = getUID();
  if (!uid) return null;

  const ref = doc(db, "users", uid, "habits", habitId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// =============================
// Update Progress Habit
// =============================
export async function updateHabit(habitId: string, update: any) {
  const uid = getUID();
  if (!uid) throw new Error("Not logged in");

  const ref = doc(db, "users", uid, "habits", habitId);
  await updateDoc(ref, update);
}

// =============================
// Delete Habit
// =============================
export async function deleteHabit(habitId: string) {
  const uid = getUID();
  if (!uid) throw new Error("Not logged in");

  const ref = doc(db, "users", uid, "habits", habitId);
  await deleteDoc(ref);
}
