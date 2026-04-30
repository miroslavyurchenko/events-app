DROP DATABASE events_platform;
CREATE DATABASE events_platform;
USE events_platform;

CREATE TABLE events (
	id INT AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(255),
	description TEXT,
	date DATETIME,
	location VARCHAR(255),
	capacity INT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	category VARCHAR(100),
    image varchar(255)
);

ALTER TABLE events ADD COLUMN user_id INT;
 
CREATE TABLE registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  telegram VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  date DATETIME NOT NULL
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'organizer') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

