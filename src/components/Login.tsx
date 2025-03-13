import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import AuthGoogle from './AuthGoogle';
import AuthPhone from './AuthPhone';

const Login: React.FC = () => {
  const [bgLoaded, setBgLoaded] = useState(false);

  return (
    <IonPage>
      <IonContent className="min-h-screen flex justify-center items-center px-4 relative">
        
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          onLoad={() => setBgLoaded(true)}
        ></div>
        
        
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        
        <div className="bg-gradient-to-br from-amber-100 to-amber-50 bg-opacity-95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl max-w-sm mx-auto border border-amber-200 overflow-hidden">
          <div className="text-center mb-6">
            <img
              src="/assets/coffee-cup.png"
              alt="Coffee Cup"
              className="w-24 h-24 mx-auto mb-4 animate-bounce"
            />
            <h2 className="text-4xl font-extrabold text-amber-900">CoffeeTime</h2>
            <p className="text-sm text-amber-700 mt-2">Войдите и насладитесь лучшим кофе!</p>
          </div>
          
          
          <div className="space-y-4">
            <AuthGoogle />
            <div className="flex items-center justify-center">
              <span className="w-1/5 border-b border-amber-400"></span>
              <span className="px-2 text-sm text-amber-700 uppercase">или</span>
              <span className="w-1/5 border-b border-amber-400"></span>
            </div>
            <AuthPhone />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
