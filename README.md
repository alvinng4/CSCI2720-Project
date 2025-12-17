# CSCI2720 Project
This is a group project for CSCI2720.

## Quick Start

### Backend
To run the backend, run the following commands:
```
cd backend
npm install
npm run init-db // This will drop existing database with the name "culturalApp"
npm run dev -- [-s|-slow-internet]
```
`-s|-slow-internet`: Simulate slow internet by adding 1s delay to all backend request

> [!IMPORTANT]\
> If you re-initialized the database after login, please logout your account on browser to prevent keeping the incorrect token ID.

### Frontend
To run the frontend, run the following commands:
```
cd frontend
npm install
npm run dev
```
Then, you may register a new account, or use the provided accounts:
* Admin: 
    - email: `admin@example.com`
    - password: `admin_csci2720`
* User:
    - email: `a@example.com`    
    - password: `a`

## Contributing
It is recommended to use linter and formatter. Simply use the following commands:
```
npm run lint
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
│     ├─ event/                           # Event-related files
│     ├─ location/                        # Location-related files
│     ├─ constants/                       # Reuseable constants
│     ├─ hooks/                           # Reuseable hooks
│     ├─ public/
│     ├─ lib/                             # Helper functions
│     └─ components/                      # Reuseable components
│        ├─ toggle-favourite.jsx          # Button to toggle favourite
│        ├─ page-shell.jsx
│        ├─ mode-toggle.jsx               # Shadcn dark mode toggle
│        ├─ theme-provider.jsx            # Shadcn dark mode theme provider
│        └─ ui/                           # Shadcn UI components
└─ backend/
    ├─ .env                               # Environment files storing secret keys
    ├─ init-db.js                         # Script for initializing database
    ├─ other config files...
    └─ src/                               # Source files for backend
    
```