import { db } from '../../src/firebase';
import { collection, addDoc } from 'firebase/firestore';
export async function addCategory(data) {
    await addDoc(collection(db, 'categories'), {
        ...data,
        products: [] // явно добавляем пустой массив продуктов
    });
}
