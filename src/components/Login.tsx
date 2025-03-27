import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';

const Login: React.FC = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Доброе утро ☕');
    else if (hour < 18) setGreeting('Капаем кофе... 👌');
    else setGreeting('Уютного вечера 🌙');
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen className="relative bg-[#f5f3ef]">
        {/* Фон */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1080&q=80"
            alt="coffee bg"
            className="w-full h-full object-cover object-center opacity-30"
          />
        </div>

        {/* Контент */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
          <div className="w-full max-w-sm bg-white/90 rounded-xl shadow-xl p-8 backdrop-blur-md animate-fadeInSlow">

            {/* Лого */}
            <div className="text-center mb-6">
              <img
                src="https://cdn-icons-png.flaticon.com/512/924/924514.png"
                alt="Coffee Logo"
                className="w-16 h-16 mx-auto mb-3"
              />
              <h1 className="text-3xl font-bold text-[#3e2c1c] uppercase tracking-wider">Coffee Addict</h1>
              <p className="text-sm text-gray-700 mt-1">{greeting}</p>
            </div>

            {/* Кофейная анимация: чашка, капли, налив */}
            <div className="relative w-full h-48 flex items-end justify-center mb-8">
              {/* Чашка */}
              <div className="w-24 h-32 rounded-b-[50%] bg-white border-2 border-[#3e2c1c] overflow-hidden relative shadow-inner">
                {/* Уровень кофе */}
                <div className="absolute bottom-0 left-0 w-full bg-[#3e2c1c] animate-fillCoffee h-0"></div>
              </div>              
            </div>

            {/* Кнопки */}
            <div className="space-y-4">
              <button className="w-full py-3 bg-[#3e2c1c] text-white rounded-lg font-medium hover:bg-[#5a3c2c] transition">
                Войти с Google
              </button>
              <div className="flex items-center text-gray-400 text-xs uppercase">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3">или</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
              <button className="w-full py-3 border border-[#3e2c1c] text-[#3e2c1c] rounded-lg font-medium hover:bg-[#f3f1ef] transition">
                Войти по номеру
              </button>
            </div>
          </div>
        </div>

        {/* Стили */}
        <style>{`
          @keyframes drop {
            0% {
              top: 0;
              opacity: 0;
              transform: translateY(0);
            }
            10% {
              opacity: 1;
            }
            100% {
              top: 100px;
              opacity: 0;
              transform: translateY(20px);
            }
          }

          @keyframes fillCoffee {
            0% {
              height: 0%;
            }
            100% {
              height: 85%;
            }
          }

          .animate-fillCoffee {
            animation: fillCoffee 8s ease-out forwards;
          }

          .animate-drop {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            animation: drop 2s ease-in infinite;
          }

          .drop1 {
            animation-delay: 0s;
          }

          .drop2 {
            animation-delay: 1s;
          }

          @keyframes fadeInSlow {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fadeInSlow {
            animation: fadeInSlow 1.5s ease-out forwards;
          }
        `}</style>
      </IonContent>
    </IonPage>
  );
};

export default Login;
