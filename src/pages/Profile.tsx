import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton, IonIcon } from "@ionic/react";
import { logOutOutline, pencilOutline } from "ionicons/icons";

export default function ProfilePage() {
  return (
    <IonPage>
      <IonHeader className="bg-gray-900 text-white">
        <IonToolbar>
          <IonTitle className="text-center">Профиль</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="bg-gray-800 text-white flex flex-col items-center py-6">
        <IonAvatar className="w-24 h-24 border-4 border-white shadow-lg">
          <img src="/assets/avatar.png" alt="Avatar" className="rounded-full" />
        </IonAvatar>
        <h2 className="mt-4 text-xl font-semibold">Имя пользователя</h2>
        <p className="text-gray-400">+7 (705) 309-62-06</p>
        <p className="text-yellow-500 mt-2">Бонусы: 120</p>
        
        <div className="mt-6 space-x-4">
          <IonButton color="light" className="text-gray-900">
            <IonIcon icon={pencilOutline} slot="start" /> Редактировать
          </IonButton>
          <IonButton color="danger">
            <IonIcon icon={logOutOutline} slot="start" /> Выйти
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}
