import './App.css';
import { Route, Routes, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const API_URL = "https://localhost:7185";

// --- КОМПОНЕНТ ГОЛОВНОЇ (Букування для користувачів) ---
function IndexPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [booking, setBooking] = useState({ roomId: '', startDate: '', endDate: '' });

  useEffect(function() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Отримуємо дані про себе
    fetch(`${API_URL}/Users/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => setUser(data))
    .catch(() => { localStorage.clear(); navigate("/login"); });

    // Отримуємо список кімнат
    fetch(`${API_URL}/Rooms`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setRooms(data));
  }, [navigate]);

  function handleBooking(e) {
    e.preventDefault();
    fetch(`${API_URL}/Bookings`, { // Припустимо, у тебе є такий контролер
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      },
      body: JSON.stringify(booking)
    }).then(res => res.ok ? alert("Заброньовано!") : alert("Помилка"));
  }

  return (
    <div className="container">
      <nav>
        <span>Привіт, {user?.name}!</span> | 
        {(user?.role === "Admin" || user?.role === "Moderator") && <Link to="/admin"> Адмінка</Link>} | 
        <button onClick={() => { localStorage.clear(); navigate("/login"); }}>Вийти</button>
      </nav>

      <h1>Оренда кімнат</h1>
      
      <div className="content-split">
        <section>
          <h3>Доступні кімнати</h3>
          {rooms.map(r => (
            <div key={r.id} className="card">
              <h4>{r.name}</h4>
              <p>Ціна: {r.price} грн</p>
            </div>
          ))}
        </section>

        <section>
          <h3>Забронювати</h3>
          <form onSubmit={handleBooking}>
            <select onChange={e => setBooking({...booking, roomId: e.target.value})} required>
              <option value="">Оберіть кімнату</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <input type="date" onChange={e => setBooking({...booking, startDate: e.target.value})} required />
            <input type="date" onChange={e => setBooking({...booking, endDate: e.target.value})} required />
            <button type="submit">Оформити оренду</button>
          </form>
        </section>
      </div>
    </div>
  );
}
function RegisterPage() {
  const navigate = useNavigate();

  function onsubmit(e) {
    e.preventDefault();
    const data = {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value
    };

    fetch(`${API_URL}/Users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(res => {
      if (!res.ok) throw new Error("Вже існує або помилка");
      return fetch(`${API_URL}/Users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password })
      });
    })
    .then(res => res.json())
    .then(tokens => {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      navigate("/");
    })
    .catch(err => alert(err.message));
  }

  return (
    <div className="auth-box">
      <h1>Реєстрація</h1>
      <form onSubmit={onsubmit}>
        <input name="name" placeholder="Ім'я" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Пароль" required />
        <button type="submit">Створити акаунт</button>
      </form>
      <Link to="/login">Вже є акаунт? Увійти</Link>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();

  function onsubmit(e) {
    e.preventDefault();
    fetch(`${API_URL}/Users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: e.target.email.value,
        password: e.target.password.value
      })
    })
    .then(res => res.json())
    .then(tokens => {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      navigate("/");
    })
    .catch(() => alert("Невірний логін"));
  }

  return (
    <div className="auth-box">
      <h1>Вхід</h1>
      <form onSubmit={onsubmit}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Пароль" required />
        <button type="submit">Увійти</button>
      </form>
      <Link to="/register">Реєстрація</Link>
    </div>
  );
}

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const token = localStorage.getItem("accessToken");

  function loadData() {
    fetch(`${API_URL}/Users`, { headers: { "Authorization": `Bearer ${token}` }})
      .then(res => res.json()).then(setUsers);
    fetch(`${API_URL}/Rooms`, { headers: { "Authorization": `Bearer ${token}` }})
      .then(res => res.json()).then(setRooms);
  }

  useEffect(loadData, [token]);

  function deleteUser(id) {
    fetch(`${API_URL}/Users/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` }})
      .then(loadData);
  }

  function deleteRoom(id) {
    fetch(`${API_URL}/Rooms/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` }})
      .then(loadData);
  }

  return (
    <div className="container">
      <h1>Адмін-панель</h1>
      <Link to="/">👈 Назад</Link>
      
      <h3>Користувачі</h3>
      {users.map(u => (
        <div key={u.id}>{u.email} <button onClick={() => deleteUser(u.id)}>Видалити</button></div>
      ))}

      <h3>Кімнати</h3>
      {rooms.map(r => (
        <div key={r.id}>{r.name} <button onClick={() => deleteRoom(r.id)}>Видалити</button></div>
      ))}
    </div>
  );
}

// --- ГОЛОВНИЙ КОМПОНЕНТ APP ---
function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;