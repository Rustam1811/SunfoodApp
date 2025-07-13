import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import {
  listenCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import { DrinkCategoryLocal, Product } from "../types/types";
import CategoryModal from "../components/CategoryModal";
import ProductModal from "../components/ProductModal";
import { UserContext } from "../contexts/UserContext";
import CategoryViewer from "../../src/components/CategoryViewer";

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

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#FAF3E0]">
      <div className="bg-gradient-to-r from-[#1F2937] to-[#111827] p-4 shadow">
        <h1 className="text-white text-2xl font-bold">Меню (Admin)</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 overflow-y-auto max-h-[calc(100vh-100px)]"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Категории</h2>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700"
            onClick={() => {
              setEditCat(null);
              setShowCatM(true);
            }}
          >
            Добавить категорию
          </button>
        </div>

        <div className="space-y-8">
          {cats.map(c => (
            <div key={c.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  {c.image && (
                    <img
                      src={c.image}
                      alt={c.title.ru}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <h3 className="text-lg font-semibold">{c.title.ru}</h3>
                </div>
                <div className="space-x-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      setEditCat(c);
                      setShowCatM(true);
                    }}
                  >
                    Ред.
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => deleteCategory(c.id)}
                  >
                    Удл.
                  </button>
                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() => {
                      setSelCat(c);
                      setEditProd(null);
                      setShowProdM(true);
                    }}
                  >
                    + Продукт
                  </button>
                </div>
              </div>

              <CategoryViewer title={c.title.ru} products={c.products} />
            </div>
          ))}
        </div>
      </motion.div>

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
    </div>
  );
};

export default MenuPage;
