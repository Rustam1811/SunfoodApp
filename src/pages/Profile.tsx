import React, { useState, useEffect } from 'react';

const userProfile = {
  name: "Манарбек",
  level: "Connoisseur",
  nextLevel: "Master",
  points: 185,
  pointsToNextLevel: 250,
  get progress() { return (this.points / this.pointsToNextLevel) * 100 },
  favoriteDrink: "Coconut Latte",
  mostActiveDay: "Friday",
  streak: 7,
  totalOrders: 42,
  savedAmount: 1250,
  unlockedRewards: 3,
  todaysBonus: 15,
  achievements: [
    { id: 1, name: "First Order", unlocked: true, icon: "◆", rarity: "common" },
    { id: 2, name: "Week Streak", unlocked: true, icon: "◉", rarity: "rare" },
    { id: 3, name: "Coffee Expert", unlocked: true, icon: "◈", rarity: "epic" },
    { id: 4, name: "Morning Ritual", unlocked: false, icon: "◊", rarity: "legendary" },
    { id: 5, name: "VIP Status", unlocked: false, icon: "◈", rarity: "legendary" },
  ],
  personalOffers: [
    { id: 1, title: "Double Points Friday", discount: "2x Points", expires: "Today", urgent: true },
    { id: 2, title: "Free Extra Shot", discount: "Free", expires: "3 days", urgent: false },
    { id: 3, title: "20% Off Favorite", discount: "20%", expires: "1 week", urgent: false },
  ]
};

// Анимированный счетчик с эффектами
const Counter = ({ end, duration = 1.5, delay = 0, showPlus = false }) => {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      const increment = end / (duration * 60);
      let current = 0;
      
      const counter = setInterval(() => {
        current += increment;
        if (current >= end) {
          setCount(end);
          clearInterval(counter);
          setIsAnimating(false);
        } else {
          setCount(Math.floor(current));
        }
      }, 1000 / 60);
      
      return () => clearInterval(counter);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [end, duration, delay]);
  
  return (
    <span className={`transition-all duration-200 ${isAnimating ? 'text-amber-600' : ''}`}>
      {showPlus && count > 0 ? '+' : ''}{count}
    </span>
  );
};

// Премиум карточка с расширенными эффектами
const PremiumCard = ({ children, className = "", delay = 0, onClick, hover = true, glow = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={`relative transform transition-all duration-700 ease-out cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${
        hover && isHovered ? 'scale-[1.03] -translate-y-1' : 'scale-100'
      } ${className}`}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      onClick={onClick}
    >
      {/* Магический glow эффект */}
      {glow && (
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 via-orange-500/20 to-amber-400/20 rounded-3xl blur-xl opacity-75" />
      )}
      
      {/* Основная граница */}
      <div className={`absolute inset-0 bg-gradient-to-br from-white/80 via-amber-50/60 to-orange-50/40 rounded-3xl p-[1px]`}>
        <div className="w-full h-full bg-white/95 backdrop-blur-xl rounded-3xl" />
      </div>
      
      {/* Контент */}
      <div className={`relative z-10 bg-gradient-to-br from-white/90 via-white/80 to-amber-50/30 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-xl ${
        isHovered ? 'shadow-2xl' : 'shadow-xl'
      }`}>
        {children}
      </div>
    </div>
  );
};

// Улучшенная статистическая карточка
const StatCard = ({ value, label, delay, prefix = "", suffix = "", trend = null, color = "neutral" }) => (
  <PremiumCard delay={delay} className="h-24" glow={trend === 'up'}>
    <div className="p-4 text-center relative overflow-hidden">
      {/* Тренд индикатор */}
      {trend && (
        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
          trend === 'up' ? 'bg-emerald-400' : 'bg-orange-400'
        } animate-pulse`} />
      )}
      
      <div className={`text-3xl font-light mb-1 ${
        color === 'amber' ? 'text-amber-600' : 
        color === 'emerald' ? 'text-emerald-600' : 'text-neutral-900'
      }`}>
        {prefix}<Counter end={value} duration={1.8} delay={delay + 0.3} />{suffix}
      </div>
      <p className="text-xs text-neutral-600 font-medium tracking-wide uppercase">{label}</p>
      
      {trend && (
        <div className={`text-xs mt-1 ${
          trend === 'up' ? 'text-emerald-600' : 'text-orange-600'
        }`}>
          {trend === 'up' ? '↗' : '↘'} {trend === 'up' ? 'Growing' : 'Stable'}
        </div>
      )}
    </div>
  </PremiumCard>
);

// Достижение с rarities
const Achievement = ({ achievement, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), (1.2 + index * 0.15) * 1000);
    return () => clearTimeout(timer);
  }, [index]);
  
  const getRarityColors = (rarity) => {
    switch(rarity) {
      case 'legendary': return 'from-purple-400 to-pink-400 text-white shadow-lg shadow-purple-300/50';
      case 'epic': return 'from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-300/50';
      case 'rare': return 'from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-300/50';
      default: return 'from-neutral-400 to-neutral-500 text-white shadow-md';
    }
  };
  
  return (
    <div 
      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-medium transition-all duration-700 transform ${
        isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
      } ${
        isHovered ? 'scale-110 -translate-y-1' : 'scale-100'
      } ${
        achievement.unlocked 
          ? `bg-gradient-to-br ${getRarityColors(achievement.rarity)} cursor-pointer` 
          : 'bg-gradient-to-br from-neutral-200 to-neutral-300 text-neutral-400'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {achievement.unlocked && achievement.rarity === 'legendary' && (
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-75 animate-pulse" />
      )}
      <span className="relative z-10">{achievement.unlocked ? achievement.icon : '?'}</span>
      
      {/* Tooltip */}
      {isHovered && achievement.unlocked && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
          {achievement.name}
        </div>
      )}
    </div>
  );
};

// Карточка персонального предложения
const OfferCard = ({ offer, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), (1.5 + index * 0.1) * 1000);
  }, [index]);
  
  return (
    <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
      <div className={`relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
        offer.urgent 
          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-lg shadow-amber-200/50' 
          : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
      }`}>
        {offer.urgent && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            Hot!
          </div>
        )}
        
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium text-neutral-900 text-sm">{offer.title}</h4>
            <p className="text-xs text-neutral-600">Expires {offer.expires}</p>
          </div>
          <div className={`text-lg font-bold ${offer.urgent ? 'text-amber-600' : 'text-neutral-800'}`}>
            {offer.discount}
          </div>
        </div>
        
        <button className={`w-full py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
          offer.urgent 
            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md' 
            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
        }`}>
          Claim Now
        </button>
      </div>
    </div>
  );
};

export default function PremiumProfile() {
  const [liquidHeight, setLiquidHeight] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [celebration, setCelebration] = useState(false);
  
  useEffect(() => {
    // Плавная анимация заполнения с эффектом celebration
    const timer = setTimeout(() => {
      setLiquidHeight(userProfile.progress);
      if (userProfile.progress > 70) {
        setCelebration(true);
        setTimeout(() => setCelebration(false), 2000);
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-neutral-50">
      {/* Расширенные глобальные стили */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        
        .breathe {
          animation: breathe 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-6px) rotate(1deg); }
          66% { transform: translateY(-2px) rotate(-1deg); }
        }
        
        .float {
          animation: float 8s ease-in-out infinite;
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        .sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(3deg); }
          75% { transform: rotate(-3deg); }
        }
        
        .wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
      `}</style>

      <div className="relative z-10">
        {/* Магический хедер */}
        <div className="relative h-96 flex items-center justify-center overflow-hidden">
          {/* Динамический фон */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-100/20 via-orange-50/10 to-transparent" />
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-amber-300/30 rounded-full sparkle`}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 20}%`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>
          
          {/* Центральный элемент */}
          <div className="relative">
            {/* Расширенный breathing effect */}
            <div className="absolute -inset-12 bg-gradient-to-r from-amber-200/20 via-orange-200/30 to-amber-200/20 rounded-full breathe" />
            <div className="absolute -inset-8 bg-gradient-to-r from-amber-300/20 via-orange-300/20 to-amber-300/20 rounded-full breathe" style={{animationDelay: '0.5s'}} />
            
            {/* Главный круг */}
            <div className={`relative w-40 h-40 rounded-full bg-white/80 backdrop-blur-3xl border-2 border-white/60 shadow-2xl overflow-hidden float ${celebration ? 'wiggle' : ''}`}>
              {/* Градиентное заполнение */}
              <div
                className="absolute bottom-0 w-full bg-gradient-to-t from-amber-600 via-orange-500 to-amber-400 transition-all duration-3000 ease-out"
                style={{ height: `${liquidHeight}%` }}
              />
              
              {/* Celebration sparkles */}
              {celebration && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-300 rounded-full sparkle"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </>
              )}
              
              {/* Контент */}
              <div className="relative w-full h-full flex flex-col justify-center items-center text-white z-10">
                <div className="text-4xl font-extralight mb-1">
                  <Counter end={userProfile.points} duration={2.5} delay={1} />
                </div>
                <span className="text-xs font-medium opacity-90 tracking-widest uppercase">Points</span>
                <div className="text-xs mt-1 opacity-80 text-center">
                  <Counter end={userProfile.pointsToNextLevel - userProfile.points} duration={2} delay={1.5} />
                  <span className="ml-1">to Master</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="px-6 -mt-16">
          {/* Профиль с дополнительной информацией */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extralight text-neutral-900 mb-3 tracking-tight">
              {userProfile.name}
            </h1>
            <div className="inline-flex items-center gap-4 text-sm font-medium text-neutral-700 bg-white/60 backdrop-blur-sm px-8 py-3 rounded-full border border-white/40 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                <span className="tracking-wide">{userProfile.level}</span>
              </div>
              <div className="w-px h-4 bg-neutral-300" />
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-semibold">+{userProfile.todaysBonus}</span>
                <span className="text-xs">today</span>
              </div>
            </div>
            
            {/* Progress to next level */}
            <div className="mt-4 max-w-xs mx-auto">
              <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-2000 ease-out"
                  style={{ width: `${userProfile.progress}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2 tracking-wide">
                {Math.round(userProfile.progress)}% to {userProfile.nextLevel}
              </p>
            </div>
          </div>

          {/* Улучшенная статистика */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard 
              value={userProfile.streak} 
              label="Day Streak" 
              delay={0.3}
              trend="up"
              color="amber"
            />
            <StatCard 
              value={userProfile.totalOrders} 
              label="Total Orders" 
              delay={0.4}
              trend="up"
              color="emerald"
            />
            <StatCard 
              value={userProfile.savedAmount} 
              label="Money Saved" 
              delay={0.5}
              prefix="₸"
              trend="up"
              color="emerald"
            />
          </div>

          {/* Rewards Section */}
          <PremiumCard delay={0.6} className="mb-6" glow>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-light text-neutral-900">Rewards Unlocked</h3>
                  <p className="text-sm text-neutral-600">Tap to claim your rewards</p>
                </div>
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  ◉
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 px-6 rounded-2xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-lg">◈</span>
                  <span>Claim {userProfile.unlockedRewards} Rewards</span>
                  <span className="text-lg">◦</span>
                </div>
              </button>
            </div>
          </PremiumCard>

          {/* Personal Offers - Карусель */}
          <PremiumCard delay={0.7} className="mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-light text-neutral-900">Personal Offers</h3>
                <button 
                  onClick={() => setShowAllOffers(!showAllOffers)}
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
                >
                  {showAllOffers ? 'Show Less' : 'Show All'}
                  <span className={`transition-transform ${showAllOffers ? 'rotate-180' : ''}`}>↓</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {userProfile.personalOffers.slice(0, showAllOffers ? 3 : 1).map((offer, index) => (
                  <OfferCard key={offer.id} offer={offer} index={index} />
                ))}
              </div>
            </div>
          </PremiumCard>

          {/* Расширенные достижения */}
          <PremiumCard delay={0.8} className="mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-light text-neutral-900">Achievements</h3>
                  <p className="text-sm text-neutral-600">Collect rare achievements</p>
                </div>
                <span className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                  {userProfile.achievements.filter(a => a.unlocked).length}/{userProfile.achievements.length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                {userProfile.achievements.map((achievement, index) => (
                  <Achievement 
                    key={achievement.id} 
                    achievement={achievement} 
                    index={index}
                  />
                ))}
              </div>
              
              {/* Next achievement hint */}
              <div className="mt-6 p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-2xl border border-neutral-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-neutral-300 to-neutral-400 rounded-xl flex items-center justify-center text-white text-sm">
                    ◊
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 text-sm">Next: Morning Ritual</p>
                    <p className="text-xs text-neutral-600">Order before 9 AM for 5 days</p>
                  </div>
                  <div className="ml-auto text-xs text-neutral-500">2/5 days</div>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Preferences */}
          <PremiumCard delay={0.9} className="mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-light text-neutral-900">Your Preferences</h3>
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors text-xl"
                >
                  {showDetails ? '−' : '+'}
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Favorite Drink</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600">◉</span>
                    <span className="font-medium text-neutral-900">{userProfile.favoriteDrink}</span>
                  </div>
                </div>
                
                {showDetails && (
                  <div className="space-y-4 pt-4 border-t border-neutral-200/50">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Most Active Day</span>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">◈</span>
                        <span className="font-medium text-neutral-900">{userProfile.mostActiveDay}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Preferred Time</span>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500">◐</span>
                        <span className="font-medium text-neutral-900">8:30 AM</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PremiumCard>

          {/* Call to Action */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white p-6 rounded-2xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
              <div className="text-2xl mb-2">◉</div>
              <div>Order Now</div>
              <div className="text-sm opacity-90">+15 bonus points</div>
            </button>
            
            <button className="bg-white/80 hover:bg-white backdrop-blur-md text-neutral-800 p-6 rounded-2xl font-medium transition-all duration-300 transform hover:scale-[1.02] border border-white/40 shadow-lg hover:shadow-xl">
              <div className="text-2xl mb-2">◈</div>
              <div>Find Store</div>
              <div className="text-sm text-neutral-600">Nearest location</div>
            </button>
          </div>

          {/* Sign Out */}
          <div className="pb-8">
            <button className="w-full h-14 bg-white/60 backdrop-blur-md rounded-2xl font-medium text-neutral-600 flex items-center justify-center gap-3 border border-white/30 shadow-lg hover:bg-white/80 hover:shadow-xl transition-all duration-300">
              <span className="text-lg">◦</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}