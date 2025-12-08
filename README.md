# CSCI2720 Project
This is a group project for CSCI2720.

## Quick Start
To run the frontend, run the following commands:
```
cd frontend
npm install
npm run dev
```

## Directory structure
```
CSCI2720-Project/
├─ .gitignore
├─ LICENSE
├─ README.md
├─ data/                                  # Data preprocessing
├─ frontend/                              # Frontend
│   └─ src/                               # React components
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ index.css
│     ├─ TopNav.jsx
│     ├─ Other core components...
│     ├─ constants/                       # Reuseable constants
│     ├─ hooks/
│     ├─ public/
│     ├─ lib/
│     └─ components/                      # Reuseable components
│        ├─ comments-list.jsx
│        ├─ location-side-menu.jsx
│        ├─ map-component.jsx
│        ├─ toggle-favourite.jsx
│        ├─ page-shell.jsx
│        ├─ mode-toggle.jsx               # Shadcn dark mode toggle
│        ├─ theme-provider.jsx            # Shadcn dark mode theme provider
│        └─ ui/                           # Shadcn UI components
└─ backend/                               # Backend
```