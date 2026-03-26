Here's a comprehensive README.md for your Hospital Activity Dashboard:

```markdown
# 🏥 Hospital Managmeent System Dashboard

A real-time hospital management system with employee tracking, patient management, room occupancy, shift scheduling, and badge access control.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Python](https://img.shields.io/badge/python-3.9+-green)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![FastAPI](https://img.shields.io/badge/fastapi-0.104.1-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## ✨ Features

- **Employee Management** - Add, edit, delete employees with department tracking
- **Patient Management** - Track patients with vitals (height, weight, temperature) and BMI calculation
- **Room Management** - Bed-level occupancy tracking with capacity management
- **Shift Scheduling** - Schedule and manage employee shifts with conflict detection
- **Badge Access Control** - Issue badges with access levels (basic, standard, elevated, admin)
- **Admissions** - Admit patients, assign doctors and staff
- **Activity Log** - Full audit trail with filtering and pagination
- **Real-time Updates** - WebSocket integration for live activity feed
- **Department Analytics** - Distribution charts and occupancy rates
- **Google Material Design** - Clean, modern UI with responsive design

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.9+ | Core language |
| FastAPI | 0.104.1 | Web framework |
| SQLAlchemy | 2.0.23 | ORM |
| SQLite | - | Database |
| Uvicorn | 0.24.0 | ASGI server |
| WebSockets | - | Real-time communication |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI library |
| React Router | 6.20.0 | Navigation |
| Axios | 1.6.0 | API client |
| CSS3 | - | Styling |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9 or higher** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16 or higher** - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/downloads)
- **pip** (comes with Python) - Package manager for Python

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/wangui-labs/hospital.git
cd hospital
```

### 2. Backend Setup

#### Windows:
```bash
# Create virtual environment
cd backend
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate

# Install dependencies
pip install -r ../requirements.txt
```

#### macOS/Linux:
```bash
# Create virtual environment
cd backend
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### 4. Database Initialization

The database will be automatically created when you first run the backend. It will seed:
- 14 departments (Emergency, ICU, Surgery, etc.)
- 3 default users (admin, user, system)

### 5. Run the Application

#### Start Backend Server:

```bash
# From the backend directory
cd ../backend
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Database tables created
INFO:     WAL mode enabled
INFO:     Default users created (admin/admin, user/user, system/system)
```

#### Start Frontend Development Server:

```bash
# From the frontend directory (new terminal)
cd ../frontend
npm start
```

The application will open at `http://localhost:3000`

### 6. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |
| WebSocket | ws://localhost:8000/ws/{user_id} |

## 🔐 Default Credentials

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| admin | admin | Administrator | Full access |
| user | user | Doctor | Limited access |
| system | system | System Account | Employee linking |

## 📁 Project Structure

```
hospital/
├── backend/                      # FastAPI backend
│   ├── crud/                     # Database operations
│   │   ├── __init__.py
│   │   ├── base.py               # Base CRUD class
│   │   ├── user.py               # User operations
│   │   ├── employee.py           # Employee operations
│   │   ├── patient.py            # Patient operations
│   │   ├── room.py               # Room operations
│   │   ├── badge.py              # Badge operations
│   │   ├── shift.py              # Shift operations
│   │   ├── department.py         # Department operations
│   │   ├── admission.py          # Admission operations
│   │   └── activity.py           # Activity log operations
│   ├── main.py                   # FastAPI application
│   ├── schema.py                 # SQLAlchemy models
│   ├── database.py               # Database connection
│   ├── data_structures.py        # DTOs and constants
│   └── websocket_manager.py      # WebSocket connection manager
├── frontend/                     # React frontend
│   ├── public/
│   │   └── index.html            # HTML entry point
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── common/           # Reusable components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   ├── layout/           # Layout components
│   │   │   ├── views/            # Page views
│   │   │   └── hooks/            # Custom hooks
│   │   ├── services/             # API and WebSocket clients
│   │   ├── utils/                # Helper functions
│   │   ├── styles/               # CSS files
│   │   ├── App.js                # Main app component
│   │   └── index.js              # Entry point
│   └── package.json              # Frontend dependencies
├── requirements.txt              # Python dependencies
├── cleanup.py                    # Cleanup script
└── README.md                     # This file
```

## 🧪 Testing

### Create Test Data

You can populate the database with sample data using SQL scripts:

```bash
# Connect to database
cd backend
sqlite3 hospital.db

# Run sample SQL (copy and paste)
-- Add employees, patients, rooms, etc.
```

### API Testing

Access the interactive API documentation at `http://localhost:8000/docs` to test all endpoints.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | User authentication |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/employees` | Get all employees |
| POST | `/api/admin/employees` | Create employee |
| PUT | `/api/admin/employees/{id}` | Update employee |
| DELETE | `/api/admin/employees/{id}` | Delete employee |
| GET | `/api/admin/patients` | Get all patients |
| POST | `/api/admin/patients` | Create patient |
| GET | `/api/admin/rooms` | Get all rooms |
| POST | `/api/admin/rooms` | Create room |
| POST | `/api/admissions` | Admit patient |
| GET | `/api/activity-log` | Get activity logs |
| WS | `/ws/{user_id}` | WebSocket connection |

## 🧹 Cleanup

To remove the virtual environment, node_modules, and database files:

```bash
python cleanup.py
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Paul Wangui** - *Initial work* - [wangui-labs](https://github.com/wangui-labs)

## 🙏 Acknowledgments

- Google Material Design for UI inspiration
- FastAPI community for excellent documentation
- React team for the amazing framework

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

## 🔧 Troubleshooting

### Common Issues

**Issue: `ModuleNotFoundError` for Python packages**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

**Issue: Port 8000 already in use**
```bash
# Change port
uvicorn main:app --reload --port 8001
```

**Issue: Database locked**
```bash
# Delete database and restart
rm hospital.db
uvicorn main:app --reload
```

**Issue: WebSocket connection failed**
- Ensure backend is running
- Check firewall settings
- Verify user_id is valid

**Issue: Frontend can't connect to backend**
- Check CORS settings in `main.py`
- Ensure backend is running on port 8000
- Update `API_BASE_URL` in `constants.js` if needed

---

## 📸 Screenshots

*[Add screenshots of your application here]*

---

## 🎯 Roadmap

- [ ] Add dark mode support
- [ ] Implement JWT authentication
- [ ] Add PDF report generation
- [ ] Integrate email notifications
- [ ] Add advanced analytics dashboard
- [ ] Mobile-responsive improvements
- [ ] Docker containerization
- [ ] CI/CD pipeline with GitHub Actions

---

**Made with ❤️ by Paul Wangui**
```

This README includes:
- Complete setup instructions for Windows, macOS, and Linux
- Project structure visualization
- API endpoint reference
- Troubleshooting guide
- Default credentials
- Technology stack details
- Roadmap for future features

Save this as `README.md` in your project root and commit it to your repository!
