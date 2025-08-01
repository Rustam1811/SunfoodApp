import React from "react";
import MobileAdminRoutes from "./routes/MobileAdminRoutes";

/**
 * Главное приложение админ-панели
 * Использует новую мобильную навигацию и систему ролей
 */
const AdminApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileAdminRoutes />
    </div>
  );
};

export default AdminApp;
