import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-section">
          <h3>SkillMeet</h3>
          <p>Платформа для пошуку та реєстрації на професійні події по всьому світу.</p>
        </div>

        <div className="footer-navigation">
          <h4>Навігація</h4>
            <div className="footer-links">
                <Link to="/">Головна</Link>
                <Link to="/events">Події</Link>
                <Link to="/news">Новини</Link>
                <Link to="/about">Про нас</Link>
            </div>
        </div>

        <div className="footer-section">
          <h4>Контакти</h4>
          <p>Email: info@eventhub.com</p>
          <p>Telegram: @eventhub</p>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 SkillMeet. Усі права захищені.
      </div>
    </footer>
  );
};

export default Footer;