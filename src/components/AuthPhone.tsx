import React, { useState, useEffect } from "react";
import { setUpRecaptcha, signInWithPhone, verifyPhoneCode } from "../services/authService";
import { useHistory } from "react-router-dom"; 
import { getAuth } from "firebase/auth";

const AuthPhone: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const history = useHistory(); 

  useEffect(() => {
    const initRecaptcha = async () => {
      const auth = getAuth();
      setUpRecaptcha(auth); 
    };
    initRecaptcha();
  }, []);

  const handleSendCode = async () => {
    try {
      let formattedPhone = phone.replace(/[^+0-9]/g, "");
      if (formattedPhone.startsWith("8") && !formattedPhone.startsWith("+")) {
        formattedPhone = "+7" + formattedPhone.slice(1);
      }
      await signInWithPhone(formattedPhone);
      setCodeSent(true);
      console.log("Код отправлен на телефон:", formattedPhone);
    } catch (error) {
      console.error("Ошибка при отправке SMS:", error);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const user = await verifyPhoneCode(code);
      console.log("Пользователь авторизован по телефону:", user);
      history.push("/home"); 
    } catch (error) {
      console.error("Ошибка подтверждения кода:", error);
    }
  };

  return (
    <div>
      <div id="recaptcha-container"></div>
      {!codeSent ? (
        <div>
          <input
            type="tel"
            placeholder="8 705 1236402"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSendCode}
            className="mb-4 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Отправить код
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Введите код"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleVerifyCode}
            className="mb-4 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Подтвердить код
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthPhone;
