import React, { useState } from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/react";
import { motion } from "framer-motion";
import Drinks from "./Drinks";
import Eats from "./Eats";

const Menu: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'drinks' | 'eats'>('drinks');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar
          style={{
            background: 'linear-gradient(to right, #1F2937, #111827)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <IonTitle style={{ color: 'white' }}>Меню</IonTitle>
        </IonToolbar>
        <div style={{ backgroundColor: '#374151', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '12px 16px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span
                onClick={() => setSelectedTab('drinks')}
                style={{
                  cursor: 'pointer',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  transition: 'all 0.2s ease-out',
                  backgroundColor: selectedTab === 'drinks' ? '#FFFFFF' : 'transparent',
                  color: selectedTab === 'drinks' ? '#4A3F35' : '#D1D5DB',
                  boxShadow: selectedTab === 'drinks' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
                  transform: selectedTab === 'drinks' ? 'scale(1.03)' : 'none'
                }}
              >
                Напитки
              </span>
              <span
                onClick={() => setSelectedTab('eats')}
                style={{
                  cursor: 'pointer',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  transition: 'all 0.2s ease-out',
                  backgroundColor: selectedTab === 'eats' ? '#FFFFFF' : 'transparent',
                  color: selectedTab === 'eats' ? '#4A3F35' : '#D1D5DB',
                  boxShadow: selectedTab === 'eats' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
                  transform: selectedTab === 'eats' ? 'scale(1.03)' : 'none'
                }}
              >
                Выпечка и Завтраки
              </span>
            </div>
          </div>
        </div>
      </IonHeader>
      <IonContent style={{ backgroundColor: '#FAF3E0' }}>
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {selectedTab === 'drinks' ? <Drinks /> : <Eats />}
        </motion.div>
      </IonContent>
    </IonPage>
  );
};

export default Menu;
