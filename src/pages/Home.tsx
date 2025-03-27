import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const Home: React.FC = () => {
  const hero = {
    src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&h=400&q=80",
    title: "COFFEE ADDICT",
    subtitle: "Premium Coffee Moments"
  };

  const favorites = [
    { src: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=500&h=300&q=80", name: "Холодный кофе" },
    { src: "https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=500&h=300&q=80", name: "Кофе с молоком" },
    { src: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&h=300&q=80", name: "Травяной чай" },
    { src: "https://images.unsplash.com/photo-1515442261605-e5f58c1e3cde?auto=format&fit=crop&w=500&h=300&q=80", name: "Латте" },
    { src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&h=300&q=80", name: "Мокко" },
  ];

  const offers = [
    {
      src: "https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=600&h=300&q=80",
      title: "Signature Drink 1",
      desc: "Rich, creamy and unforgettable."
    },
    {
      src: "https://images.unsplash.com/photo-1510626176961-4bfb7b41e7d7?auto=format&fit=crop&w=600&h=300&q=80",
      title: "Signature Drink 2",
      desc: "Smooth taste with premium beans."

    },
  ];

  return (
    <IonPage>
      <IonHeader className="bg-[#1a1a1a] shadow-lg">
        <IonToolbar>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-gradient-to-b from-[#F2E9DC] via-[#EADDC8] to-[#F7F1E8] text-[#3B322C] font-[Inter]">

        {/* Hero Block */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mx-4 mt-6">
          <img
            src={hero.src}
            loading="eager"
            className="w-full h-80 object-cover brightness-75"
            alt={hero.title}
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center">
            <h1 className="text-5xl font-extrabold text-white drop-shadow-2xl">{hero.title}</h1>
            <p className="text-xl text-[#ECD8BB] mt-4">{hero.subtitle}</p>
          </div>
        </div>

        {/* Exclusive Offers */}
        <div className="backdrop-blur-md bg-white/50 p-8 mt-10 mx-4 rounded-3xl shadow-xl">
          <h2 className="text-3xl font-bold mb-8 text-[#3E3E3E]">🔥 Exclusive Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {offers.map((offer, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition bg-white/60 backdrop-blur-sm">
                <img
                  src={offer.src}
                  loading="eager"
                  className="w-full h-60 object-cover"
                  alt={offer.title}
                />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold">{offer.title}</h3>
                  <p className="text-[#5A4632] mt-2">{offer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorites */}
        <div className="mt-12 mx-4 pb-32">
          <h2 className="text-3xl font-bold mb-8 text-[#3E3E3E]">🌿 Наши фавориты</h2>
          <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-4">
            {favorites.map((item, idx) => (
              <div key={idx} className="min-w-[240px] bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg hover:scale-105 transition snap-start">
                <img
                  src={item.src}
                  loading="eager"
                  className="w-full h-48 object-cover rounded-t-3xl"
                  alt={item.name}
                />
                <div className="p-5 min-h-[80px] flex items-center">
                  <h3 className="font-semibold text-xl">{item.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Home;
