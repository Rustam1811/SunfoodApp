const API_URL = import.meta.env.VITE_BACKEND_URL; // ✅ Динамический URL

export const registerUser = async (phone: string, name: string, password: string) => {
  const res = await fetch(`${API_URL}/register`, { // ✅ Только API_URL
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, name, password }),
  });

  if (!res.ok) {
    throw new Error((await res.json()).error);
  }

  return await res.json();
};

export const loginUser = async (phone: string, password: string) => {
  const res = await fetch(`${API_URL}/login`, { // ✅ Только API_URL
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });

  if (!res.ok) {
    throw new Error((await res.json()).error);
  }

  return await res.json();
};
