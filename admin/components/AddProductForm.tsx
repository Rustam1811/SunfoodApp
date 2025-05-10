import React, { useState } from 'react';
import { db } from '../../src/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { uploadImage } from '../services/storageService'; // Для загрузки картинок
import { LocalizedString } from '../types/types'; // Тип можно сюда вынести отдельно

const AddProductForm = ({ categoryId }: { categoryId: string }) => {
  const [ruName, setRuName] = useState('');
  const [kzName, setKzName] = useState('');
  const [enName, setEnName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [ruDescription, setRuDescription] = useState('');
  const [kzDescription, setKzDescription] = useState('');
  const [enDescription, setEnDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ruName || !kzName || !enName || !price || !ruDescription || !kzDescription || !enDescription || !imageFile) {
      alert('Заполни все поля!');
      return;
    }

    try {
      setLoading(true);

      const imageUrl = await uploadImage(imageFile, 'products');

      const newProduct = {
        id: Date.now(), // Временный ID, потом можно поменять генерацию
        name: {
          ru: ruName,
          kz: kzName,
          en: enName
        },
        price,
        description: {
          ru: ruDescription,
          kz: kzDescription,
          en: enDescription
        },
        ingredients: {
          ru: [],
          kz: [],
          en: []
        },
        recommendation: {
          ru: '',
          kz: '',
          en: ''
        },
        recommendations: [],
        image: imageUrl
      };

      const categoryRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryRef, {
        products: arrayUnion(newProduct)
      });

      alert('Продукт успешно добавлен!');

      // Очистка полей
      setRuName('');
      setKzName('');
      setEnName('');
      setPrice(0);
      setRuDescription('');
      setKzDescription('');
      setEnDescription('');
      setImageFile(null);
    } catch (error) {
      console.error('Ошибка при добавлении продукта:', error);
      alert('Ошибка. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Добавить продукт в категорию</h2>

      <input
        type="text"
        placeholder="Название на русском"
        value={ruName}
        onChange={(e) => setRuName(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Название на казахском"
        value={kzName}
        onChange={(e) => setKzName(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Название на английском"
        value={enName}
        onChange={(e) => setEnName(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Цена в ₸"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Описание на русском"
        value={ruDescription}
        onChange={(e) => setRuDescription(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Описание на казахском"
        value={kzDescription}
        onChange={(e) => setKzDescription(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Описание на английском"
        value={enDescription}
        onChange={(e) => setEnDescription(e.target.value)}
        className="border p-2 rounded"
      />

      <input
        type="file"
        accept="image/*"
        onChange={e => e.target.files && setImageFile(e.target.files[0])}
        className="w-full p-2 border rounded"
        required
      />


      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
      >
        {loading ? 'Добавляю...' : 'Добавить продукт'}
      </button>
    </form>
  );
};

export default AddProductForm;
