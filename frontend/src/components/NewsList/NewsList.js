import React, { useState, useEffect } from "react";
import styles from "./NewsList.module.css"; // Импорт модуля

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/news")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNews(data);
        else setNews([]);
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);

  const filteredNews = Array.isArray(news)
    ? news
        .filter(n => n.title?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];

  return (
    <div className={styles.newsContainer}>
      <h2 className={styles.title}>Новини</h2>

      <div className={styles.filterForm}>
        <input
          type="text"
          placeholder="Пошук новини..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setSearch("")}>Очистити</button>
      </div>

      <div className={styles.newsGrid}>
        {filteredNews.length > 0 ? (
          filteredNews.map(item => (
            <div key={item.id} className={styles.newsCard}>
              <h3>{item.title}</h3>
              <p>{item.content}</p>
              <span>📅 {new Date(item.date).toLocaleString('uk-UA', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>Новин не знайдено :(</p>
        )}
      </div>
    </div>
  );
};

export default NewsList;