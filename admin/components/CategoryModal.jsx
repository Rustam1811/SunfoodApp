import React, { useState, useEffect } from "react";
const CategoryModal = ({ initialData, onClose, onSave, }) => {
    const empty = { ru: "", kz: "", en: "" };
    const [title, setTitle] = useState(empty);
    const [image, setImage] = useState(initialData?.image || '');
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setImage(initialData.image || '');
        }
        else {
            setTitle(empty);
            setImage("");
        }
    }, [initialData]);
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, image, products: initialData?.products || [] }, initialData?.id);
        onClose();
    };
    return (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">
          {initialData ? "Редактировать категорию" : "Новая категория"}
        </h2>
        {["ru", "kz", "en"].map(lang => (<input key={lang} placeholder={`Название (${lang})`} value={title[lang]} onChange={e => setTitle(t => ({ ...t, [lang]: e.target.value }))} required className="w-full p-2 border rounded"/>))}
        <input type="text" placeholder="URL картинки категории" value={image} onChange={e => setImage(e.target.value)} className="w-full p-2 border rounded" required/>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Отмена
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Сохранить
          </button>
        </div>
      </form>
    </div>);
};
export default CategoryModal;
