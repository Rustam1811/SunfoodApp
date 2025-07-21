import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LocalizedString, DrinkCategoryLocal } from "../types/types";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface CategoryModalProps { 
  initialData: DrinkCategoryLocal | null; 
  onClose: () => void; 
  onSave: (data: Omit<DrinkCategoryLocal, 'id'>, id?: string) => void 
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  initialData,
  onClose,
  onSave,
}) => {
  const empty: LocalizedString = { ru: "", kz: "", en: "" };
  const [title, setTitle] = useState<LocalizedString>(empty);
  // const [description, setDescription] = useState<LocalizedString>(empty); // Removed because 'description' does not exist
  const [image, setImage] = useState<string>(initialData?.image || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      // setDescription(initialData.description || empty); // Removed because 'description' does not exist
      setImage(initialData.image || '');
    } else {
      setTitle(empty);
      setImage("");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ 
        title, 
        image, 
        products: initialData?.products || [] 
      }, initialData?.id);
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    { code: 'ru' as keyof LocalizedString, name: 'Русский', flag: '🇷🇺' },
    { code: 'kz' as keyof LocalizedString, name: 'Қазақша', flag: '🇰🇿' },
    { code: 'en' as keyof LocalizedString, name: 'English', flag: '🇺🇸' }
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {initialData ? "Редактировать категорию" : "Новая категория"}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Изображение категории
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  {image ? (
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <PhotoIcon className="w-8 h-8 text-amber-500" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    placeholder="URL изображения"
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Вставьте ссылку на изображение
                  </p>
                </div>
              </div>
            </div>

            {/* Title Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Название категории
              </label>
              <div className="space-y-3">
                {languages.map(lang => (
                  <div key={lang.code} className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium text-gray-600">{lang.name}</span>
                    </div>
                    <input
                      type="text"
                      placeholder={`Введите название на ${lang.name.toLowerCase()}`}
                      value={title[lang.code]}
                      onChange={e => setTitle(prev => ({ ...prev, [lang.code]: e.target.value }))}
                      required
                      className="w-full pl-28 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Description Fields */}
            {/* Description Fields removed because 'description' does not exist on DrinkCategoryLocal */}
            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Сохранение...
                  </div>
                ) : (
                  initialData ? "Сохранить изменения" : "Создать категорию"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CategoryModal;
