import React, { useState } from 'react';
import { addCategory } from '../services/addCategory';
import { uploadImage } from '../services/storageService';
const AddCategoryForm = () => {
    const [ruTitle, setRuTitle] = useState('');
    const [kzTitle, setKzTitle] = useState('');
    const [enTitle, setEnTitle] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!ruTitle || !kzTitle || !enTitle || !imageFile) {
            alert('Пожалуйста, заполни все поля!');
            return;
        }
        try {
            setLoading(true);
            // Загрузка изображения
            const imageUrl = await uploadImage(imageFile, 'categories');
            // Формирование новой категории
            const newCategory = {
                id: Date.now(), // Строка, чтобы не ругался TypeScript
                title: {
                    ru: ruTitle.trim(),
                    kz: kzTitle.trim(),
                    en: enTitle.trim(),
                },
                image: imageUrl,
            };
            await addCategory(newCategory);
            alert('Категория успешно добавлена!');
            // Очистка формы
            setRuTitle('');
            setKzTitle('');
            setEnTitle('');
            setImageFile(null);
        }
        catch (error) {
            console.error('Ошибка при добавлении категории:', error);
            alert('Произошла ошибка. Попробуй снова.');
        }
        finally {
            setLoading(false);
        }
    };
    return (<form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Добавить категорию</h2>

      <input type="text" placeholder="Название на русском" value={ruTitle} onChange={(e) => setRuTitle(e.target.value)} className="border p-2 rounded"/>
      <input type="text" placeholder="Название на казахском" value={kzTitle} onChange={(e) => setKzTitle(e.target.value)} className="border p-2 rounded"/>
      <input type="text" placeholder="Название на английском" value={enTitle} onChange={(e) => setEnTitle(e.target.value)} className="border p-2 rounded"/>

      <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="border p-2 rounded"/>

      <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
        {loading ? 'Добавляю...' : 'Добавить категорию'}
      </button>
    </form>);
};
export default AddCategoryForm;
