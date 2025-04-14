console.log('🧪 Using local /api/ endpoints (no CORS)');

export const registerUser = async (phone: string, name: string, password: string) => {
  const res = await fetch('/api/register', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, name, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Ошибка регистрации");
  }

  return await res.json();
};

export const loginUser = async (phone: string, password: string) => {
  const res = await fetch('/api/login', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Ошибка входа");
  }

  return await res.json();
};
