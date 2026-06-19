import { useEffect, useState } from "react";
import api from "../api";

type User = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        setUser(null);
      }
    }

    loadMe();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setMessage("Logged out on client only");
  }

  return (
    <div>
      <h2>Home</h2>

      {user ? (
        <div>
          <p>Logged in as: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>No logged in user</p>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}
