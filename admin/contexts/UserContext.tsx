import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  FC,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  getIdTokenResult,
  signOut,
} from "firebase/auth";
import { app } from "../../src/firebase";

export interface User {
  uid: string;
  email: string | null;
  role: "owner" | "admin" | "user";
}

interface Context {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const UserContext = createContext<Context>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, async u => {
      if (u) {
        const tokenRes = await getIdTokenResult(u, true);
        const role = (tokenRes.claims.role as User["role"]) || "user";
        setUser({ uid: u.uid, email: u.email, role });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};
