import React, { useEffect, useState } from "react";
import styles from "./Admin.module.css";

const Admin = () => {
  // --- Состояния ---
  const [stats, setStats] = useState([]);
  const [news, setNews] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  // Состояния для списка участников
  const [selectedEventUsers, setSelectedEventUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    category: "IT",
    image: ""
  });

  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    date: ""
  });

  // --- Загрузка данных ---
  const loadStats = () => {
    fetch("http://localhost:5000/admin/stats")
      .then(res => res.json())
      .then(data => setStats(Array.isArray(data) ? data : []))
      .catch(err => console.error("Помилка статистики:", err));
  };

  const loadNews = () => {
    fetch("http://localhost:5000/admin/news")
      .then(res => res.json())
      .then(data => setNews(Array.isArray(data) ? data : []))
      .catch(err => console.error("Помилка новин:", err));
  };

  useEffect(() => {
    loadStats();
    loadNews();
  }, []);

  // --- Функции для Событий ---
  const startEdit = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      date: event.date ? event.date.slice(0, 16) : "",
      category: event.category || "IT",
      image: event.image || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingEvent(null);
    setForm({ title: "", description: "", location: "", date: "", category: "IT", image: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingEvent 
      ? `http://localhost:5000/admin/events/${editingEvent.id}` 
      : "http://localhost:5000/admin/events";
    
    try {
      const res = await fetch(url, {
        method: editingEvent ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert(editingEvent ? "Подію оновлено! ✏️" : "Подію створено! ✨");
        cancelEdit();
        loadStats();
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Видалити цю подію?")) return;
    try {
      const res = await fetch(`http://localhost:5000/events/${id}`, { method: "DELETE" });
      if (res.ok) setStats(prev => prev.filter(event => event.id !== id));
    } catch (err) { console.error(err); }
  };

  // --- Функции для Участников ---
  const viewRegistrations = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/events/${eventId}/registrations`);
      const data = await res.json();
      setSelectedEventUsers(data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Помилка завантаження учасників:", err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEventUsers([]);
  };

  // --- Функции для Новостей ---
  const handleAddNews = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsForm)
      });
      if (res.ok) {
        alert("Новину додано! 📰");
        setNewsForm({ title: "", content: "", date: "" });
        loadNews();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm("Видалити новину?")) return;
    try {
      const res = await fetch(`http://localhost:5000/admin/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNews(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.title}>Адмін панель</h1>

      {/* Форма событий */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {editingEvent ? "✏️ Редагувати подію" : "Додати нову подію"}
        </h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            placeholder="Назва події"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className={styles.textarea}
            placeholder="Короткий опис"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className={styles.input}
            placeholder="Місто / Локація"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            className={styles.input}
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <select 
            className={styles.select}
            value={form.category} 
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option>IT</option>
            <option>Business</option>
            <option>Design</option>
            <option>Marketing</option>
            <option>Education</option>
          </select>
          <input
            className={styles.input}
            placeholder="URL зображення"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
          
          <div className={styles.formButtons}>
            <button type="submit" className={styles.submitBtn}>
              {editingEvent ? "Зберегти зміни" : "Створити подію"}
            </button>
            {editingEvent && (
              <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>
                Скасувати
              </button>
            )}
          </div>
        </form>
      </div>

      <hr className={styles.divider} />

      {/* Список событий */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Управління подіями</h2>
        {stats.length > 0 ? (
          stats.map(event => (
            <div key={event.id} className={styles.card}>
              <div className={styles.cardInfo}>
                <h3>{event.title}</h3>
                <p>👤 Реєстрацій: <strong>{event.registrations || 0}</strong></p>
                <p>🌍 {event.location || "Місце не вказано"}</p>
                <p>📅 {event.date ? new Date(event.date).toLocaleString('uk-UA') : "Дата не вказана"}</p>
              </div>
              <div className={styles.actions}>
                <button className={styles.viewBtn} onClick={() => viewRegistrations(event.id)}>Учасники</button>
                <button className={styles.editBtn} onClick={() => startEdit(event)}>Редагувати</button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(event.id)}>Видалити</button>
              </div>
            </div>
          ))
        ) : <p>Подій поки немає...</p>}
      </div>

      <hr className={styles.divider} />

      {/* Блок Новостей */}
      <div className={styles.splitLayout}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Додати новину</h2>
          <form onSubmit={handleAddNews} className={styles.form}>
            <input
              className={styles.input}
              placeholder="Заголовок новини"
              value={newsForm.title}
              onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
              required
            />
            <textarea
              className={styles.textarea}
              placeholder="Текст новини"
              value={newsForm.content}
              onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
              required
            />
            <input
              className={styles.input}
              type="datetime-local"
              value={newsForm.date}
              onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
              required
            />
            <button type="submit" className={styles.submitBtn}>Опублікувати новину</button>
          </form>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Список новин</h2>
          {news.length > 0 ? (
            news.map(item => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardInfo}>
                  <h3>{item.title}</h3>
                  <p>{new Date(item.date).toLocaleDateString()}</p>
                </div>
                <button 
                  className={styles.deleteBtn} 
                  onClick={() => handleDeleteNews(item.id)}
                >
                  Видалити
                </button>
              </div>
            ))
          ) : <p>Новин поки немає...</p>}
        </div>
      </div>

      {/* Модальное окно участников */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Список зареєстрованих</h2>
              <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              {selectedEventUsers && selectedEventUsers.length > 0 ? (
                <table className={styles.userTable}>
                  <thead>
                    <tr>
                      <th>Ім'я</th>
                      <th>Прізвище</th>
                      <th>Email</th>
                      <th>Telegram</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEventUsers.map((user, idx) => (
                      <tr key={idx}>
                        <td>{user.first_name}</td>
                        <td>{user.last_name}</td>
                        <td>{user.email}</td>
                        <td>{user.telegram || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>На цю подію ще ніхто не зареєструвався.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;