# LectureSafe Documentation

## Overview

LectureSafe is a simple Progressive Web Application (PWA) that helps students calculate their attendance. Users enter the required attendance percentage, total lectures conducted, and lectures attended. The application instantly shows the current attendance percentage, attendance status, safe missed classes, and the number of classes required to meet the target.

The entire application works in the browser without using any backend or database, making it fast, lightweight, and privacy-friendly.

---

## Technologies Used

* HTML5
* CSS3
* JavaScript (ES6)
* Progressive Web App (PWA)
* Service Worker

---

## Project Structure

```
LectureSafe/
│── index.html
│── style.css
│── script.js
│── sw.js
│── manifest.json
│── icon-192.png
│── icon-512.png
```

---

## Features

* Calculate attendance percentage
* Display attendance status (Safe, Warning, Recovery)
* Calculate safe classes that can be missed
* Show classes required to reach the target attendance
* Responsive design for mobile and desktop
* Light and Dark mode
* Offline support using Service Worker
* Fast and easy-to-use interface

---

## How It Works

1. Enter the required attendance percentage.
2. Enter the total number of lectures conducted.
3. Enter the number of lectures attended.
4. Click **Calculate**.
5. The application displays the attendance percentage, attendance status, safe missed classes, and recovery information.

---

## Architecture

The project follows a simple three-layer structure:

* **HTML** – Page structure
* **CSS** – User interface and styling
* **JavaScript** – Attendance calculation and user interaction

The application runs completely on the client side without storing user data.

---

## Advantages

* Simple and lightweight
* No login or database required
* Fast calculations
* Works offline after installation
* Easy to maintain and extend

---

## Future Improvements

* Attendance history
* Subject-wise attendance tracking
* Notifications and reminders
* Data export feature
* Cloud synchronization

---

## Conclusion

LectureSafe is a lightweight attendance calculator designed for students. It provides quick and accurate attendance calculations through a clean and responsive interface while keeping all user data private by processing everything directly in the browser.
