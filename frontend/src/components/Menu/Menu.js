import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Menu.module.css";

const Menu = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Состояния для модалок и пользователя
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);

  // Состояния для ошибок
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Данные формы
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "organizer"
  });

  // Пункты меню
  const items = [
    { name: "Головна", path: "/" },
    { name: "Події", path: "/events" },
    { name: "Новини", path: "/news" },
    { name: "Про нас", path: "/about" }
  ];

  // Загрузка пользователя при старте
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  // Закрытие мобильного меню при смене страницы
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Функция входа
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Невірний логін");

      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setIsOpen(false);
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setErrorMessage(err.message);
      setIsErrorOpen(true);
    }
  };

  // Функция регистрации
  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "organizer" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Помилка реєстрації");
      alert("Реєстрація успішна!");
      setMode("login");
    } catch (err) {
      setErrorMessage(err.message);
      setIsErrorOpen(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mode === "login" ? handleLogin() : handleRegister();
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <>
      <nav className={styles.menu}>
        <div className={styles.menuInner}>
          <div className={styles.logo}>
            <Link to="/">SkillMeet</Link>
          </div>

          <button 
            className={styles.burgerBtn} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className={isMobileMenuOpen ? styles.burgerClose : ""}></span>
          </button>

          <div className={`${styles.navWrapper} ${isMobileMenuOpen ? styles.navActive : ""}`}>
            <ul className={styles.menuList}>
              {items.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={location.pathname === item.path ? styles.active : ""}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.authActions}>
              {!user ? (
                <button className={styles.loginBtn} onClick={() => { setIsOpen(true); setIsMobileMenuOpen(false); }}>
                  Увійти
                </button>
              ) : (
                <div className={styles.userBlock}>
                  <span className={styles.userEmail}>{user.email}</span>
                  <button className={styles.logoutBtn} onClick={logout}>Вийти</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Модалка логина/регистрации */}
      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{mode === "login" ? "Вхід" : "Реєстрація"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button type="submit" className={styles.submitBtn}>
                {mode === "login" ? "Увійти" : "Зареєструватися"}
              </button>
            </form>
            <p className={styles.switchMode}>
              {mode === "login" ? "Немає акаунта?" : "Вже є акаунт?"}
              <span onClick={() => setMode(mode === "login" ? "register" : "login")}>
                {mode === "login" ? " Реєстрація" : " Увійти"}
              </span>
            </p>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>Закрити</button>
          </div>
        </div>
      )}

      {/* Модалка ошибки */}
      {isErrorOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsErrorOpen(false)}>
          <div className={`${styles.modal} ${styles.errorModal}`} onClick={(e) => e.stopPropagation()}>
            <h2>Помилка ❌</h2>
            <p>{errorMessage}</p>
            <button className={styles.closeBtn} onClick={() => setIsErrorOpen(false)}>Закрити</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Menu;