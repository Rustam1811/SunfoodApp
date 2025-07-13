import { storage } from '../../src/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
export async function uploadImage(file, folder) {
    const storageRef = ref(storage, `${folder}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
}
