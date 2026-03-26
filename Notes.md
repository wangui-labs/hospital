# 1. Backend setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 2. In a new terminal, frontend setup
cd frontend
npm install
npm start


To reinstall the environment:
  Backend:
    cd backend
    python -m venv .venv
    .venv\Scripts\activate
    pip install -r ../requirements.txt

  Frontend:
    cd frontend
    npm install
    npm start