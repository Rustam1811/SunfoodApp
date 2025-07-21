import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../src/firebase";
import { Product, LocalizedString } from "../types/types";
import { XMarkIcon, PhotoIcon, CurrencyDollarIcon, LinkIcon } from "@heroicons/react/24/outline";

interface Props {
  categoryId: string;
  initialData: Product | null;
  onClose(): void;
}

const ProductModal: React.FC<Props> = ({
  categoryId,
  initialData,
  onClose,
}) => {
  const emptyName: LocalizedString = { ru: "", kz: "", en: "" };
  const [name, setName] = useState<LocalizedString>(initialData?.name || emptyName);
  const [desc, setDesc] = useState<LocalizedString>(initialData?.description || emptyName);
  const [price, setPrice] = useState(initialData?.price || 0);
  const [image, setImage] = useState(initialData?.image || "");
  const [paymentLink, setPaymentLink] = useState(initialData?.paymentLink || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDesc(initialData.description || emptyName);
      setPrice(initialData.price);
      setImage(initialData.image || "");
      setPaymentLink(initialData.paymentLink || "");
    }
  }, [initialData]);

  const save = async () => {
    setLoading(true);
    try {
      const prod: Product = {
        id: initialData?.id || Date.now().toString(),
        name,
        description: desc,
        price,
        image,
        paymentLink,
      };
      
      const ref = doc(db, "categories", categoryId);
      
      if (initialData) {
        // Update existing product
        await updateDoc(ref, { products: arrayRemove(initialData) });
        await updateDoc(ref, { products: arrayUnion(prod) });
      } else {
        // Add new product
        await updateDoc(ref, { products: arrayUnion(prod) });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
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
                {initialData ? "Редактировать напиток" : "Новый напиток"}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Image and Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Изображение напитка
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
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    placeholder="0"
                    value={price || ''}
                    onChange={e => setPrice(Number(e.target.value))}
                    required
                    min="0"
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₸</span>
                </div>
              </div>
            </div>

            {/* Payment Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ссылка для оплаты (необязательно)
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  placeholder="https://example.com/payment"
                  value={paymentLink}
                  onChange={e => setPaymentLink(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Name Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Название напитка
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
                      value={name[lang.code]}
                      onChange={e => setName(prev => ({ ...prev, [lang.code]: e.target.value }))}
                      required
                      className="w-full pl-28 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Description Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Описание напитка (необязательно)
              </label>
              <div className="space-y-3">
                {languages.map(lang => (
                  <div key={lang.code} className="relative">
                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium text-gray-600">{lang.name}</span>
                    </div>
                    <textarea
                      placeholder={`Введите описание на ${lang.name.toLowerCase()}`}
                      value={desc[lang.code]}
                      onChange={e => setDesc(prev => ({ ...prev, [lang.code]: e.target.value }))}
                      rows={3}
                      className="w-full pl-28 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

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
                onClick={save}
                disabled={loading || !name.ru || price <= 0}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Сохранение...
                  </div>
                ) : (
                  initialData ? "Сохранить изменения" : "Добавить напиток"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductModal;
