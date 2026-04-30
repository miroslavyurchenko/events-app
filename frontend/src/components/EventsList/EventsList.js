import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Добавили useLocation
import styles from "./EventsList.module.css";

const EventsList = () => {
  const navigate = useNavigate();
  const locationHook = useLocation(); // Получаем доступ к URL

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("");
  const [dateOrder, setDateOrder] = useState("asc");

  useEffect(() => {
    // 1. Считываем параметры из URL (например, ?category=IT)
    const queryParams = new URLSearchParams(locationHook.search);
    const categoryFromUrl = queryParams.get("category");

    // 2. Если категория есть в URL, ставим её в стейт
    if (categoryFromUrl) {
      setCategory(categoryFromUrl);
    } else {
      setCategory("all"); // Если параметра нет, сбрасываем на "все"
    }

    // 3. Загружаем данные
    fetch("http://localhost:5000/events")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEvents(data);
        else setEvents([]);
      })
      .catch(err => console.error("Fetch error:", err));
  }, [locationHook.search]); // Следим за изменением URL

  const now = new Date();

  const filteredEvents = Array.isArray(events)
    ? events
        .filter(event => {
          const searchValue = search.toLowerCase();
          const locationValue = location.toLowerCase();

          const matchesSearch = event.title?.toLowerCase().includes(searchValue);
          const matchesCategory = category === "all" || event.category === category;
          const matchesLocation = event.location?.toLowerCase().includes(locationValue);

          return (
            (search ? matchesSearch : true) &&
            (category !== "all" ? matchesCategory : true) &&
            (location ? matchesLocation : true)
          );
        })
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          const isExpiredA = dateA < now;
          const isExpiredB = dateB < now;

          if (isExpiredA !== isExpiredB) return isExpiredA ? 1 : -1;
          return dateOrder === "asc" ? dateA - dateB : dateB - dateA;
        })
    : [];

  const handleClick = (id, isExpired) => {
    if (isExpired) return;
    navigate(`/events/${id}`);
  };

  return (
    <div className={styles.eventsContainer}>
      <h2>Події</h2>

      <div className={styles.filterForm}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Всі категорії</option>
          <option value="IT">IT</option>
          <option value="Business">Business</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Education">Education</option>
        </select>

        <input
          type="text"
          placeholder="Пошук..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="text"
          placeholder="Місто..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <select value={dateOrder} onChange={(e) => setDateOrder(e.target.value)}>
          <option value="asc">Спочатку найближчі</option>
          <option value="desc">Спочатку пізні</option>
        </select>

        <button onClick={() => { setSearch(""); setCategory("all"); setLocation(""); setDateOrder("asc"); navigate("/events"); }}>
          Очистити
        </button>
      </div>

      <div className={styles.eventsGrid}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => {
            const isExpired = new Date(event.date) < now;
            return (
              <div
                key={event.id}
                className={`${styles.eventCard} ${isExpired ? styles.expired : ""}`}
                onClick={() => handleClick(event.id, isExpired)}
              >
                <h3>{event.title} {isExpired && "(Завершено)"}</h3>
                <p>{event.description}</p>
                <span>🌍 {event.location || "Не вказано"}</span>
                <span>📅 {new Date(event.date).toLocaleString('uk-UA')}</span>
              </div>
            );
          })
        ) : (
          <p className={styles.noResults}>Подій не знайдено :(</p>
        )}
      </div>
    </div>
  );
};

export default EventsList;