import React, { createContext, useState, useEffect, } from "react";
import { getAuth, onAuthStateChanged, getIdTokenResult, signOut, } from "firebase/auth";
import { app } from "../../src/firebase";
export const UserContext = createContext({
    user: null,
    loading: true,
    logout: async () => { },
});
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const auth = getAuth(app);
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (u) {
                const tokenRes = await getIdTokenResult(u, true);
                const role = tokenRes.claims.role || "user";
                setUser({ uid: u.uid, email: u.email, role });
            }
            else {
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
    return (<UserContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserContext.Provider>);
};
