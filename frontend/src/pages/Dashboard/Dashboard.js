import React, { useEffect, useState, useCallback } from "react";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  // --- Состояния для списка участников ---
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

  // =========================
  // 📥 ЗАГРУЗКА СОБЫТИЙ
  // =========================
  const loadEvents = useCallback(() => {
    fetch(`http://localhost:5000/organizer/events/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  }, [user.id]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // =========================
  // 👥 ФУНКЦИИ УЧАСТНИКОВ
  // =========================
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

  // =========================
  // ✏️ РЕДАКТИРОВАНИЕ
  // =========================
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
        body: JSON.stringify({ ...form, user_id: user.id })
      });
      if (res.ok) {
        alert(editingEvent ? "Подію оновлено ✏️" : "Подію створено 🎉");
        cancelEdit();
        loadEvents();
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Видалити подію?")) return;
    try {
      const res = await fetch(`http://localhost:5000/events/${id}`, { method: "DELETE" });
      if (res.ok) setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className={styles.dashboardPage}>
      <h1 className={styles.title}>Кабінет організатора 👤</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {editingEvent ? "Редагувати подію" : "Створити подію"}
        </h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input className={styles.input} placeholder="Назва" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className={styles.textarea} placeholder="Опис" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className={styles.input} placeholder="Місто" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input className={styles.input} type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <select className={styles.select} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option>IT</option>
            <option>Business</option>
            <option>Design</option>
            <option>Marketing</option>
            <option>Education</option>
          </select>
          <input className={styles.input} placeholder="URL картинки" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          
          <div className={styles.formButtons}>
            <button className={styles.submitBtn} type="submit">{editingEvent ? "Зберегти" : "Створити"}</button>
            {editingEvent && <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>Скасувати</button>}
          </div>
        </form>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Мої події</h2>
        {events.length > 0 ? (
          events.map(event => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventInfo}>
                <h3>{event.title}</h3>
                <p>📍 {event.location}</p>
                <p>📅 {new Date(event.date).toLocaleString('uk-UA')}</p>
                <p>👥 Реєстрацій: <strong>{event.registrations || 0}</strong></p>
              </div>
              <div className={styles.actions}>
                <button className={styles.viewBtn} onClick={() => viewRegistrations(event.id)}>Учасники</button>
                <button className={styles.editBtn} onClick={() => startEdit(event)}>Редагувати</button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(event.id)}>Видалити</button>
              </div>
            </div>
          ))
        ) : <p className={styles.empty}>У вас ще немає подій</p>}
      </div>

      {/* --- МОДАЛЬНОЕ ОКНО --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Список зареєстрованих</h2>
              <button className={styles.closeModalBtn} onClick={closeModal}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              {selectedEventUsers && selectedEventUsers.length > 0 ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.userTable}>
                    <thead>
                      <tr>
                        <th>Ім'я</th>
                        <th>Email</th>
                        <th>Telegram</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEventUsers.map((u, idx) => (
                        <tr key={idx}>
                          <td>{u.first_name} {u.last_name}</td>
                          <td>{u.email}</td>
                          <td>{u.telegram || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p>На цю подію ще ніхто не зареєструвався.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;