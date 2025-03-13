import React from "react";
import Login from "../components/Login";
import AuthGoogle from "../components/AuthGoogle";
import AuthPhone from "../components/AuthPhone";

const LoginPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Добро пожаловать!</h1>
      <Login />
      <hr className="my-6" />
      <AuthGoogle />
      <hr className="my-6" />
      <AuthPhone />
    </div>
  );
};

export default LoginPage;
