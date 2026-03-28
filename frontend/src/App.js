import './App.css';
import { Route, Routes, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const API_URL = "https://localhost:7185";

function IndexPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [booking, setBooking] = useState({ roomId: '', dateStart: '', dateEnd: '' });
  const [myBookings, setMyBookings] = useState([]);

  function loadMyBookings() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch(`${API_URL}/Books/my`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => { return res.json(); })
    .then(data => 
      { 
        console.log(data);
        setMyBookings(data); 
      })
    .catch(err => { console.error("Помилка завантаження", err); });
  }

  useEffect(function() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetch(`${API_URL}/Users/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => { return res.ok ? res.json() : Promise.reject(); })
    .then(data => { setUser(data); })
    .catch(() => { 
      localStorage.clear(); 
      navigate("/login"); 
    });

    fetch(`${API_URL}/Rooms`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => { return res.json(); })
    .then(data => { setRooms(data); });

    loadMyBookings();
  }, [navigate]);

  function handleBooking(e) {
    e.preventDefault();
    fetch(`${API_URL}/Books`, { 
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      },
      body: JSON.stringify(booking)
    })
    .then(res=> {
      if (res.ok) {
        alert("Заброньовано!");
        loadMyBookings(); 
        setBooking({ roomId: '', dateStart: '', dateEnd: '' }); 
      } 
      else {
        alert("Помилка при бронюванні");
      }
    });
  }

  return (
    <div className="container">
      <nav>
        <span>Привіт, {user?.name}!</span> | 
        {(user?.role === "Admin" || user?.role === "Moderator") && <Link to="/admin">Адмінка</Link>} | 
        <button onClick={() => { 
          localStorage.clear(); 
          navigate("/login"); 
        }}> Вийти</button>
      </nav>

      <h1>Оренда кімнат</h1>
      
      <div className="content-split">
        <section>
          <h3>Доступні кімнати</h3>
          {rooms.filter(r => !r.isOccupied).map(function(r) {
            return (
              <div className="card">
                <h4>{r.name}</h4>
                <p>{r.description}</p>
                <p><b>Ціна: {r.price} грн</b></p>
              </div>
            );
          })}
        </section>

        {user?.role === "User" && (
          <section>
            <h3>Забронювати</h3>
            <form onSubmit={handleBooking}>
              <select 
                value={booking.roomId}
                onChange={e => setBooking({...booking, roomId: e.target.value})} 
                required
              >
                <option value="">Оберіть кімнату</option>
                {rooms.filter(r => !r.isOccupied).map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <input 
                type="date" 
                value={booking.dateStart}
                onChange={e => setBooking({...booking, dateStart: e.target.value})} 
                required
                min={new Date().toISOString().split("T")[0]} 
              />
              <input 
                type="date" 
                value={booking.dateEnd}
                onChange={e => setBooking({...booking, dateEnd: e.target.value})} 
                required
                min={booking.dateStart || new Date().toISOString().split("T")[0]} 
              />
              <button type="submit">Оформити оренду</button>
            </form>
          </section>
      )}
      </div>

      <hr/>
      
      <h3>Мої оренди</h3>
      {myBookings.length > 0 ? (
        myBookings.map(b => {
        return (
          <div className="card">
            <p>Кімната: {rooms.find(r => r.id === b.roomId)?.name || "Невідомо"}</p>
            <p>З {new Date(b.dateStart).toLocaleDateString()} по {new Date(b.dateEnd).toLocaleDateString()}</p>
            <p>Вартість: {b.totalPrice} грн</p>
          </div>
        );
      })
      ) : <p>У вас ще немає бронювань</p>}
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
    .then(data => {
      localStorage.setItem("accessToken", data.token); 
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
    .then(res => {
      if (!res.ok) {
        throw new Error("Невірний логін або пароль");
      }
      return res.json();
    })
    .then(data => {
      localStorage.setItem("accessToken", data.token); 
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
  const [roomForm, setRoomForm] = useState({ id: null, name: '', description: '', price: '' });
  const token = localStorage.getItem("accessToken");

  function loadData() {
    fetch(`${API_URL}/Users`, { headers: { "Authorization": `Bearer ${token}` }})
      .then(res => res.json()).then(setUsers);
    fetch(`${API_URL}/Rooms`, { headers: { "Authorization": `Bearer ${token}` }})
      .then(res => res.json()).then(setRooms);
  }

  useEffect(loadData, [token]);

  function saveRoom(e) {
    e.preventDefault();
    const isEdit = roomForm.id !== null;
    const url = isEdit ? `${API_URL}/Rooms/${roomForm.id}` : `${API_URL}/Rooms`;
    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({
        name: roomForm.name,
        description: roomForm.description,
        price: Number(roomForm.price)
      })
    }).then(res => {
      if (res.ok) {
        setRoomForm({ id: null, name: '',description: '', price: '' }); 
        loadData();
      } else {
        alert("Помилка при збереженні кімнати");
      }
    });
  }

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
      <Link to="/">Назад</Link>
      
      <div className="admin-grid">
        <section>
          <h3>{roomForm.id ? "Редагувати кімнату" : "Додати нову кімнату"}</h3>
          <form onSubmit={saveRoom} className="admin-form">
            <input 
              placeholder="Назва кімнати" 
              value={roomForm.name}
              onChange={e => setRoomForm({...roomForm, name: e.target.value})}
              required 
            />
            <input 
              placeholder="Опис" 
              value={roomForm.description}
              onChange={e => setRoomForm({...roomForm, description: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="Ціна за добу" 
              value={roomForm.price}
              onChange={e => setRoomForm({...roomForm, price: e.target.value})}
              required 
            />
            <button type="submit">{roomForm.id ? "Оновити" : "Створити"}</button>
            {roomForm.id && <button onClick={() => setRoomForm({id: null, name: '',description:'', price: ''})}>Скасувати</button>}
          </form>

          <h3>Список кімнат</h3>
          {rooms.map(r => (
            <div key={r.id} className="admin-item">
              <span><b>{r.name}</b> — {r.price} грн</span>
              <div>
                <button onClick={() => setRoomForm({ id: r.id, name: r.name, description: r.description, price: r.price })}>Змінити</button>
                <button onClick={() => deleteRoom(r.id)}>Видалити</button>
              </div>
            </div>
          ))}
        </section>

        <section>
          <h3>Користувачі</h3>
          {users.map(u => (
            <div key={u.id} className="admin-item">
              <span>{u.email} ({u.role})</span>
              <button onClick={() => deleteUser(u.id)}>Видалити</button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

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