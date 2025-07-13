import { db } from "../../src/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, } from "firebase/firestore";
const COLL = "categories";
export const listenCategories = (callback) => {
    const colRef = collection(db, COLL);
    return onSnapshot(colRef, snap => {
        const cats = snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
        }));
        callback(cats);
    });
};
export const addCategory = (data) => addDoc(collection(db, COLL), data);
export const updateCategory = (id, data) => updateDoc(doc(db, COLL, id), data);
export const deleteCategory = (id) => deleteDoc(doc(db, COLL, id));
