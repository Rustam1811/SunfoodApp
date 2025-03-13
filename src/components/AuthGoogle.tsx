import React from "react";
import { signInWithGoogle } from "../services/authService";
import { useHistory } from "react-router-dom"; 

const AuthGoogle: React.FC = () => {
  const history = useHistory();

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      console.log("Пользователь Google:", user);
      history.push("/home"); 
    } catch (error) {
      console.error("Ошибка Google входа:", error);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full py-3 bg-amber-600 text-white font-semibold rounded-full shadow-lg hover:bg-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center justify-center"
    >
      Войти через Google
    </button>
  );
};

export default AuthGoogle;
