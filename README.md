# 🍽️ Group Dining Simplified — Team D PBL4

**Team D PBL4** is a lightweight web application that streamlines the group dining experience. It helps groups collaboratively choose restaurants, vote on options, and even split bills — all without any backend server.

## 🌟 Project Summary

This project was developed under the constraint of **no backend** or external server usage. Instead, it leverages **[JSONbin.io](https://jsonbin.io/)** as a lightweight cloud storage solution through JavaScript.

## 🔧 Features

- 🔍 **Search Restaurants**: Find restaurant options based on keywords or categories.
- 🗳️ **Voting System**: Invite friends to vote on a restaurant from a shared list.
- 💸 **Bill Splitter**: Divide the bill fairly among group members with customizable settings.
- 📦 **Fully Frontend-Based**: Built entirely with HTML, CSS, and JavaScript.
- ☁️ **Uses JSONbin.io**: All data is stored and retrieved using the JSONbin.io API.

## 🛠️ Built With

- **HTML** – Markup structure
- **CSS** – Responsive styling
- **JavaScript** – Application logic and interactivity
- **JSONbin.io** – Lightweight, API-based JSON storage

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MelancholicMelon/Team_D_PBL4.git
cd Team_D_PBL4
```

### 2. Open `index.html` in your browser

Just double-click the file or serve it with a local web server:

```bash
# Example using Python 3
python -m http.server
```

### 3. Update Your JSONbin.io Keys (Important!)

This app uses hardcoded API keys to access bins. Replace them in the JavaScript files (`script.js`, etc.) with your own [JSONbin.io](https://jsonbin.io/) credentials.

> ⚠️ **Do NOT commit your API keys to GitHub.** Consider removing them before pushing or using a safer method in production.

## 🧹 Cleanup Note (Security)

If you have accidentally pushed sensitive API keys:
- **Revoke the key** from JSONbin.io immediately.
- Replace it in your local project.
- Use tools like [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) or `git filter-repo` to remove it from your Git history.


- 🧑‍🤝‍🧑 Developed as part of **PBL4 (Project-Based Learning)** course
