// src/admin/services/firestoreService.ts
import { db } from '../../src/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
const firestoreService = {
    async getCollection(path) {
        const colRef = collection(db, path);
        const snapshot = await getDocs(colRef);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async addDocument(path, data) {
        const colRef = collection(db, path);
        const ref = await addDoc(colRef, data);
        return ref.id;
    },
    async updateDocument(path, id, data) {
        const docRef = doc(db, path, id);
        await updateDoc(docRef, data);
    },
    async deleteDocument(path, id) {
        const docRef = doc(db, path, id);
        await deleteDoc(docRef);
    },
};
export default firestoreService;
