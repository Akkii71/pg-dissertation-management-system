# PG Dissertation Management System
> **Academic Research & Dissertation Management Terminal Application**

A lightweight, robust, and interactive Terminal / CLI application developed for post-graduate dissertation lifecycle management based on the Ministry of AYUSH problem statement.

---

## 📌 Project Overview

PG dissertation is a mandatory requirement for the fulfillment of a Post-Graduate degree. During the 1st year of post-graduation, students select a PG dissertation topic and carry out research under the supervision of an allocated PG guide, submitting their dissertation during the final year for evaluation.

This terminal application provides an intuitive command-line interface for **Students**, **Guides**, and **Administrators** to manage research topics, prevent duplicate research, assign supervisors, and process dissertation approvals.

### Problem Statement & Domain Focus
- **Year:** 2023
- **Domain:** Smart Education
- **Category:** Software / Terminal Application
- **Organisation:** Ministry of AYUSH

---

## 💻 Tech Stack & Architecture

- **Runtime:** Node.js (v18+)
- **Interface:** Terminal / CLI (Standard I/O, `readline`)
- **Data Persistence:** Local JSON storage (`data/`)
- **External Dependencies:** Zero (pure Node.js standard libraries for maximum portability and speed)

---

## 📂 Project Structure

```text
pg-dissertation-management-system/
├── data/
│   ├── users.json             # Student, Guide, and Admin records
│   ├── topics.json            # Departmental thrust area research topics
│   └── dissertations.json     # Proposed and active dissertation records
├── src/
│   ├── menus/
│   │   ├── studentMenu.js     # Student actions (View topics, Propose, View dissertation)
│   │   ├── guideMenu.js       # Guide actions (Pending topics, My students, Approve/Reject)
│   │   └── adminMenu.js       # Admin actions (Add topic, View lists, Assign guide)
│   ├── storage.js             # Data access layer & duplicate prevention logic
│   └── utils.js               # CLI prompt helpers and formatting utilities
├── index.js                   # Application entry point & main menu
├── package.json               # Project manifest and start script
├── .gitignore                 # Git ignore rules
└── README.md                  # Comprehensive project documentation
```

---

## 🚀 How to Run the Application

### Prerequisites
- Node.js installed (`node -v` >= 18.x)

### Running the App
From the project root directory:

```bash
npm start
```
*or alternatively:*
```bash
node index.js
```

---

## 🖥️ Terminal Menu Walkthrough

### Main Menu
```text
========================================
 PG DISSERTATION MANAGEMENT SYSTEM
========================================

1. Student
2. Guide
3. Admin
4. Exit

Enter choice:
```

---

### 1. Student Menu
Accessible by selecting `1` from Main Menu:
- **1. View Available Topics**: Lists all available departmental research thrust topics.
- **2. Propose Dissertation Topic**:
  - Select student profile.
  - Choose an existing departmental topic OR propose a custom research title.
  - **Duplicate Prevention**: System automatically checks if the topic title already exists and prevents duplicates.
  - Select PG Guide to review.
  - Submits proposal under `Pending Review` status.
- **3. View My Dissertation**: View student's current dissertation status, assigned guide, and review comments.
- **4. Back**: Return to Main Menu.

---

### 2. Guide Menu
Accessible by selecting `2` from Main Menu:
- **1. View Pending Topics**: Displays all dissertation proposals currently awaiting review.
- **2. View My Students**: Displays students assigned to the guide and their research progress.
- **3. Approve Topic**: Select pending dissertation proposal and record approval remarks.
- **4. Reject Topic**: Reject proposal with revision feedback.
- **5. Back**: Return to Main Menu.

---

### 3. Admin Menu
Accessible by selecting `3` from Main Menu:
- **1. Add Dissertation Topic**: Add new departmental research thrust topic (includes instant duplicate detection).
- **2. View All Topics**: View comprehensive list of departmental research topics.
- **3. View Students**: View all registered PG scholars and their research status.
- **4. View Guides**: View faculty supervisors and current student-guide ratio load.
- **5. Assign Guide**: Assign or re-allocate a PG guide to a student.
- **6. Back**: Return to Main Menu.

---

## 🛡️ Key Features Implemented

1. **Duplicate Topic Prevention**: Strict case-insensitive title validation preventing identical research topics across both registered topics and student proposals.
2. **Role-Based Workflows**: Tailored terminal interfaces for Students, Guides, and Administrators.
3. **JSON Data Persistence**: Changes to users, topics, and dissertations persist immediately to local JSON files.
4. **Student-Guide Load Visibility**: Tracks guide capacity and allocated scholars to support balanced student-guide ratios.
5. **Clean Terminal UX**: Structured tables, banners, dividers, and status indicators designed for ease of demonstration to faculty.

---

## 📄 License
This project is licensed under the ISC License.
