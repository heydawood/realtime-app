import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs.map((doc) => doc.data());
};
