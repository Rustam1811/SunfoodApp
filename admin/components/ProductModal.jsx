import React, { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../src/firebase";
const ProductModal = ({ categoryId, initialData, onClose, }) => {
    const emptyName = { ru: "", kz: "", en: "" };
    const [name, setName] = useState(initialData?.name || emptyName);
    const [desc, setDesc] = useState(initialData?.description || emptyName);
    const [price, setPrice] = useState(initialData?.price || 0);
    const [image, setImage] = useState(initialData?.image || "");
    const [paymentLink, setPaymentLink] = useState(initialData?.paymentLink || "");
    useEffect(() => {
        if (initialData)
            setPaymentLink(initialData.paymentLink || "");
    }, [initialData]);
    const save = async () => {
        const prod = {
            id: initialData?.id || Date.now().toString(),
            name,
            description: desc,
            price,
            image,
            paymentLink,
        };
        const ref = doc(db, "categories", categoryId);
        if (initialData) {
            await updateDoc(ref, { products: arrayRemove(initialData) });
            await updateDoc(ref, { products: arrayUnion(prod) });
        }
        else {
            await updateDoc(ref, { products: arrayUnion(prod) });
        }
        onClose();
    };
    return (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-3">
        <h2 className="text-xl font-bold">
          {initialData ? "Редактировать напиток" : "Новый напиток"}
        </h2>
        {["ru", "kz", "en"].map(l => (<input key={l} placeholder={`Название (${l})`} value={name[l]} onChange={e => setName(n => ({ ...n, [l]: e.target.value }))} required className="w-full p-2 border rounded"/>))}
        {["ru", "kz", "en"].map(l => (<input key={l} placeholder={`Описание (${l})`} value={desc[l]} onChange={e => setDesc(d => ({ ...d, [l]: e.target.value }))} className="w-full p-2 border rounded"/>))}
        <input type="number" placeholder="Цена" value={price} onChange={e => setPrice(+e.target.value)} required className="w-full p-2 border rounded"/>
        <input type="text" placeholder="URL картинки категории" value={image} onChange={e => setImage(e.target.value)} className="w-full p-2 border rounded" required/>
        <input placeholder="Ссылка «Заказать и оплатить»" value={paymentLink} onChange={e => setPaymentLink(e.target.value)} className="w-full p-2 border rounded"/>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Отмена
          </button>
          <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Сохранить
          </button>
        </div>
      </div>
    </div>);
};
export default ProductModal;
