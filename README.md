# CSCI2720 Project
This is a group project for CSCI2720.

## Quick Start

### Backend
To run the backend, run the following commands:
```
cd backend
npm install
npm run init-db // This will drop existing database with the name "culturalApp"
npm run dev
```

### Frontend
To run the frontend, run the following commands:
```
cd frontend
npm install
npm run dev
```

## Contributing
It is recommended to use linter and formatter. For linting:
```
npm run lint
```
For formatting:
```
npm run format
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