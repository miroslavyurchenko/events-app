import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import "./EventDetails.css";

const EventDetails = () => {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState([]);

  // 🔥 МОДАЛКИ
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    telegram: ""
  });

  // 🔥 событие
  useEffect(() => {
    fetch(`http://localhost:5000/events/${id}`)
      .then(res => res.json())
      .then(data => setEvent(data));
  }, [id]);

  // 🔥 статистика
  useEffect(() => {
    fetch(`http://localhost:5000/events/${id}/stats`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, [id]);

  // 🔥 отправка формы
  const handleSubmit = async (e) => {
  e.preventDefault();

  const { firstName, lastName, email, telegram } = formData;

  if (!firstName || !lastName || !email || !telegram) {
    setIsErrorOpen(true);
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event_id: event.id,
        ...formData
      })
    });

    const data = await response.json();

    console.log("Ответ сервера:", data);

    setIsOpen(false);
    setIsSuccessOpen(true);

  } catch (err) {
    console.error("Ошибка:", err);
    setIsErrorOpen(true);
  }
};

  if (!event || !event.id) return <p className="loading">Завантаження...</p>;

  return (
    <div className="event-page">

      {/* HERO */}
      <div
        className="event-hero"
        style={{ backgroundImage: `url(${event.image})` }}
      >
        <div className="overlay">
          <h1>{event.title}</h1>
        </div>
      </div>

      <div className="event-content">

        {/* LEFT */}
        <div className="event-left">
          <div
            className="event-image"
            style={{ backgroundImage: `url(${event.image})` }}
          />

          <div className="event-description">
            <h3>Про подію</h3>
            <p>{event.description}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="event-right">

          {/* 🔥 КНОПКА */}
          <button className="register-btn" onClick={() => setIsOpen(true)}>
            Зареєструватися
          </button>

          <div className="event-info">
            <p>📅 {new Date(event.date).toLocaleDateString()}</p>
            <p>⏰ {new Date(event.date).toLocaleTimeString()}</p>
            <p>📍 {event.location}</p>
            <p>🏷️ {event.category}</p>
          </div>

          {/* 📊 ГРАФИК */}
          <div className="event-stats">
            <h4>Активність</h4>

            {stats.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>Немає даних</p>
            )}
          </div>

        </div>
      </div>

      {/* ===== МОДАЛКА ФОРМИ ===== */}
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Реєстрація на подію</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Імʼя"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Прізвище"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Telegram (@username)"
                value={formData.telegram}
                onChange={(e) =>
                  setFormData({ ...formData, telegram: e.target.value })
                }
              />

              <button type="submit">Надіслати</button>
            </form>

            <button className="close-btn" onClick={() => setIsOpen(false)}>
              Закрити
            </button>
          </div>
        </div>
      )}

      {/* ===== УСПІХ ===== */}
      {isSuccessOpen && (
        <div className="modal-overlay" onClick={() => setIsSuccessOpen(false)}>
          <div className="modal success-modal">
            <h2>Реєстрація успішна 🎉</h2>
            <p>Ви зареєстровані на подію:</p>
            <strong>{event.title}</strong>

            <button
              className="close-btn"
              onClick={() => setIsSuccessOpen(false)}
            >
              Закрити
            </button>
          </div>
        </div>
      )}

      {/* ===== ПОМИЛКА ===== */}
      {isErrorOpen && (
        <div className="modal-overlay" onClick={() => setIsErrorOpen(false)}>
          <div className="modal error-modal">
            <h2>Помилка ❌</h2>
            <p>Заповніть всі поля!</p>

            <button
              className="close-btn"
              onClick={() => setIsErrorOpen(false)}
            >
              Закрити
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventDetails;