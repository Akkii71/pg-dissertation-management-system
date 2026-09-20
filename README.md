# PG Dissertation Management System

A terminal-based Node.js CLI application for managing the complete lifecycle of PG (Post-Graduate) dissertations — from topic proposal to final evaluation and publication.

## Getting Started

### Requirements
- Node.js (v14 or above)

### Install & Run
```bash
npm install
npm start
```

The application runs entirely in your terminal. No browser or internet connection needed.

---

## How It Works

Data is stored locally in JSON files inside the `data/` directory:
- `data/users.json` — students, guides, admin
- `data/topics.json` — departmental research topics
- `data/dissertations.json` — dissertation records

No database server is required. All changes persist automatically.

---

## Dissertation Workflow

```
Admin adds topic → Admin assigns guide → Student proposes topic
→ Guide approves → Student updates progress → Student submits
→ Guide evaluates → Publication recorded → University result set
```

---

## Features

### Student Menu
1. **View Available Topics** — Browse departmental research topics
2. **Propose Dissertation Topic** — Select from existing topics or propose a custom one
3. **View My Dissertation** — See full record: topic status, progress, evaluation result, university result, and publication
4. **Update Progress** — Enter current research completion percentage (0–100%)
5. **Submit Dissertation** — Mark dissertation as submitted (guide must be assigned and topic must be approved)

### Guide Menu
1. **View My Students** — See all assigned students and their dissertation status
2. **Approve Topic** — Approve a pending student topic
3. **Reject Topic** — Reject a pending student topic with reason
4. **View Student Progress** — See progress bars for all assigned students
5. **Evaluate Dissertation** — Award marks and set result (Approved / Rejected)
6. **Record Publication** — Log publication details after dissertation approval

### Admin Menu
1. **Add Dissertation Topic** — Create topics in the departmental pool
2. **View All Topics** — List all registered topics with status
3. **View Students** — See all students, their guide, and dissertation summary
4. **View Guides** — See all guides and their student load
5. **Assign Guide** — Assign a PG guide to a student (max 5 students per guide)
6. **View Dissertation Status** — Full overview of all dissertations with university result
7. **Search Dissertations** — Search by student name, topic, category, domain, or department
8. **Record Publication** — Record publication details for approved dissertations

---

## University Result Status

| Evaluation State | University Result |
|---|---|
| Not yet evaluated | Pending |
| Approved | Eligible |
| Rejected | Withheld |

---

## Key Rules
- A student cannot submit without an assigned guide
- A topic must be approved before submission
- A guide can only evaluate submitted dissertations
- A guide cannot be assigned more than 5 students
- Duplicate topic titles are automatically prevented

---

## Commit History
| Commit | Description |
|---|---|
| `5e83afb` | Initialize PG dissertation management system |
| `d7eadd2` | Convert system to terminal application |
| `6a45ba6` | Add core dissertation workflow |
| `latest`  | Complete dissertation management features |
