import React, { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listenCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import { DrinkCategoryLocal, Product } from "../types/types";
import CategoryModal from "../components/CategoryModalNew";
import ProductModal from "../components/ProductModalNew";
import { UserContext } from "../contexts/UserContext";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  Squares2X2Icon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const MenuPage: React.FC = () => {
  const [cats, setCats] = useState<DrinkCategoryLocal[]>([]);
  const [editCat, setEditCat] = useState<DrinkCategoryLocal | null>(null);
  const [selCat, setSelCat] = useState<DrinkCategoryLocal | null>(null);
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [showCatM, setShowCatM] = useState(false);
  const [showProdM, setShowProdM] = useState(false);
  const { user, loading } = useContext(UserContext);

  useEffect(() => {
    if (!loading) {
      const unsub = listenCategories(setCats);
      return () => unsub();
    }
  }, [loading]);

  const onSaveCat = async (
    data: Omit<DrinkCategoryLocal, "id">,
    id?: string
  ) => {
    if (id) await updateCategory(id, data);
    else await addCategory(data);
    setShowCatM(false);
  };

  if (loading || !user) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600 text-center">Загрузка админки...</p>
      </div>
    </div>
  );

  // Навигация по категориям для мобильных
  const [catIdx, setCatIdx] = useState(0);
  useEffect(() => {
    if (cats.length > 0 && catIdx >= cats.length) setCatIdx(cats.length - 1);
  }, [cats, catIdx]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-amber-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <Squares2X2Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Меню Админ
                </h1>
                <p className="text-sm text-gray-600">Управление категориями и напитками</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditCat(null);
                setShowCatM(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <PlusIcon className="w-5 h-5" />
              Новая категория
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {cats.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <SparklesIcon className="w-12 h-12 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Создайте первую категорию</h3>
            <p className="text-gray-600 mb-6">Начните добавлять напитки в ваше меню</p>
            <button
              onClick={() => {
                setEditCat(null);
                setShowCatM(true);
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-2xl font-semibold hover:scale-105 transition-transform"
            >
              Создать категорию
            </button>
          </motion.div>
        ) : (
          <>
            {/* Навигационные кнопки для категорий на мобильных */}
            <div className="flex items-center gap-2 mb-4 md:hidden">
              <button
                className="px-3 py-2 rounded-lg bg-white text-slate-700 shadow"
                disabled={catIdx === 0}
                onClick={() => setCatIdx(idx => Math.max(0, idx - 1))}
              >←</button>
              <span className="font-bold text-lg text-amber-700">{cats[catIdx]?.title?.ru || ''}</span>
              <button
                className="px-3 py-2 rounded-lg bg-white text-slate-700 shadow"
                disabled={catIdx === cats.length - 1}
                onClick={() => setCatIdx(idx => Math.min(cats.length - 1, idx + 1))}
              >→</button>
            </div>
            {/* Сетка категорий: на мобильных показываем только одну, на десктопе все */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {(window.innerWidth < 768 && cats[catIdx] ? [cats[catIdx]] : cats).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Category Header */}
                  <div className="relative h-32 bg-gradient-to-br from-amber-100 to-orange-100">
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.title.ru}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => {
                          setEditCat(category);
                          setShowCatM(true);
                        }}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <PencilIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="w-8 h-8 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{category.title.ru}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{'Описание отсутствует'}</p>
                    {/* Products Count */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        {category.products?.length || 0} напитков
                      </span>
                      <button
                        onClick={() => setSelCat(category)}
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Просмотр
                      </button>
                    </div>
                    {/* Add Product Button */}
                    <button
                      onClick={() => {
                        setSelCat(category);
                        setEditProd(null);
                        setShowProdM(true);
                      }}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Добавить напиток
                    </button>
                  </div>
                  {/* Products Preview */}
                  {category.products && category.products.length > 0 && (
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-2 gap-3">
                        {category.products.slice(0, 4).map((product, pIndex) => (
                          <div
                            key={product.id}
                            className="bg-gray-50 rounded-2xl p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => {
                              setEditProd(product);
                              setSelCat(category);
                              setShowProdM(true);
                            }}
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl mb-2 flex items-center justify-center">
                              {product.image ? (
                                <img src={product.image} alt={product.name.ru} className="w-8 h-8 object-cover rounded-lg" />
                              ) : (
                                <span className="text-2xl">☕</span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-800 truncate">{product.name.ru}</p>
                            <p className="text-xs text-gray-500">{product.price} ₸</p>
                          </div>
                        ))}
                      </div>
                      {category.products.length > 4 && (
                        <p className="text-center text-sm text-gray-500 mt-3">
                          +{category.products.length - 4} ещё
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Modals */}
      <AnimatePresence>
        {showCatM && (
          <CategoryModal
            initialData={editCat}
            onClose={() => setShowCatM(false)}
            onSave={onSaveCat}
          />
        )}
        {showProdM && selCat && (
          <ProductModal
            categoryId={selCat.id}
            initialData={editProd}
            onClose={() => setShowProdM(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuPage;
