import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import styles from "./Home.module.css"; // Импорт стилей как объекта

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/events")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEvents(data);
        else setEvents([]);
      })
      .catch(err => console.error("Ошибка загрузки:", err));
  }, []);

  const topEvents = events.slice(0, 6);

  return (
    <div className={styles.home}>

      {/* 🔥 HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Знайди свою ідеальну подію</h1>
          <p>Конференції, воркшопи, зустрічі по всьому світу</p>

          <button onClick={() => navigate("/events")} className={styles.ctaBtn}>
            Переглянути події
          </button>
        </div>
      </section>

      {/* 🔹 КАТЕГОРИИ */}
      <section className={styles.categories}>
        <h2>Категорії</h2>

        <div className={styles.categoryGrid}>
          {["IT", "Business", "Design", "Marketing", "Education"].map(cat => (
            <div
              key={cat}
              className={styles.categoryCard}
              onClick={() => navigate(`/events?category=${cat}`)}
            >
              {cat}
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 ПОПУЛЯРНЫЕ СОБЫТИЯ */}
      <section className={styles.topEvents}>
        <h2>Популярні події</h2>

        <div className={styles.eventsGrid}>
          {topEvents.map(event => (
            <div
              key={event.id}
              className={styles.eventCard}
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <div
                className={styles.eventImage}
                style={{ backgroundImage: `url(${event.image})` }}
              />

              <div className={styles.eventInfo}>
                <h3>{event.title}</h3>
                <p>🌍 {event.location || "Локація не вказана"}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 WHY US */}
      <section className={styles.features}>
        <h2>Чому обирають нас</h2>

        <div className={styles.featuresGrid}>
          <div className={styles.feature}>
            <h3>Події по всьому світу</h3>
            <p>Знаходь івенти в будь-якій країні та місті, де б ти не був.</p>
          </div>

          <div className={styles.feature}>
            <h3>Швидка реєстрація</h3>
            <p>Забудь про довгі форми. Записуйся на цікаві зустрічі за кілька секунд.</p>
          </div>

          <div className={styles.feature}>
            <h3>Актуальна інформація</h3>
            <p>Ми ретельно перевіряємо кожну подію, щоб ти отримував тільки найкраще.</p>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Не пропусти свою можливість</h2>
        <button onClick={() => navigate("/events")} className={styles.ctaBtnLarge}>
          Знайти подію
        </button>
      </section>

      <Footer />

    </div>
  );
};

export default Home;