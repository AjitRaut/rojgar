# Rojgar Find — Backend (FastAPI)

AI-powered workforce hiring platform connecting customers, companies, and local skilled workers.

## Tech Stack

- **Python 3.11+**
- **FastAPI** + **Uvicorn**
- **SQLAlchemy 2.0** + **Alembic**
- **PostgreSQL**
- **Pydantic v2** + **pydantic-settings**
- **JWT** auth (python-jose) + **bcrypt** (passlib)
- **OpenAI** for AI features
- **ReportLab** for invoice PDFs

## Folder Structure

```
backend/
├── alembic/                     # Database migrations
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── app/
│   ├── api/v1/
│   │   ├── endpoints/           # All route handlers
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── workers.py
│   │   │   ├── companies.py
│   │   │   ├── jobs.py
│   │   │   ├── reviews.py
│   │   │   ├── complaints.py
│   │   │   ├── admin.py
│   │   │   ├── ai.py
│   │   │   └── uploads.py
│   │   └── router.py            # v1 master router
│   ├── core/                    # Config, DB, security, deps, exceptions
│   ├── middleware/              # Global error handlers
│   ├── models/                  # SQLAlchemy ORM models
│   ├── schemas/                 # Pydantic schemas (request/response)
│   ├── services/                # Business logic layer
│   ├── utils/                   # Logger, helpers, PDF
│   └── main.py                  # FastAPI app entry
├── scripts/
│   └── seed_admin.py            # Seed first admin
├── tests/
├── uploads/                     # Uploaded files (gitignored)
├── .env.example
├── .gitignore
├── alembic.ini
├── requirements.txt
└── run.py
```

## Roles

- `customer` — household user hiring single workers
- `worker` — individual skilled/unskilled labor
- `company` — bulk hiring, projects, recurring crews
- `admin` — platform control, verification, analytics

## Setup (Local Development)

### 1. Prerequisites
- Python 3.11+
- PostgreSQL 14+ running locally

### 2. Create database
```bash
createdb rojgar_find
```

### 3. Clone and install
```bash
cd backend
python -m venv venv
source venv/bin/activate    # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Environment variables
```bash
cp .env.example .env
```

Then edit `.env`:
- Set `DATABASE_URL` to your Postgres connection string
- Set `JWT_SECRET_KEY` to a strong random string (min 32 chars)
- Set `OPENAI_API_KEY` to your real OpenAI key (starts with `sk-`)

### 5. Run database migrations
```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

### 6. Seed an admin
```bash
python -m scripts.seed_admin
```
Default: `admin@rojgarfind.com` / `Admin@12345` (change in `scripts/seed_admin.py`).

### 7. Start the server
```bash
python run.py
```
or
```bash
uvicorn app.main:app --reload
```

Server runs at **http://localhost:8000**
- Swagger docs: **http://localhost:8000/docs**
- ReDoc: **http://localhost:8000/redoc**

## Key API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register customer/worker/company |
| POST | `/api/v1/auth/login` | Login (JSON) |
| POST | `/api/v1/auth/token` | OAuth2 form login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Current user |

### Workers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/workers` | Search workers (skill, city, rating) |
| GET | `/api/v1/workers/{user_id}` | Public worker profile |
| GET | `/api/v1/workers/me` | My worker profile |
| PATCH | `/api/v1/workers/me` | Update my worker profile |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/jobs` | Post a job (customer/company) |
| GET | `/api/v1/jobs` | List & search jobs |
| GET | `/api/v1/jobs/{id}` | Job detail |
| PATCH | `/api/v1/jobs/{id}` | Update job (owner) |
| DELETE | `/api/v1/jobs/{id}` | Delete job (owner) |
| POST | `/api/v1/jobs/{id}/apply` | Apply (worker) |
| GET | `/api/v1/jobs/{id}/applications` | List applicants (owner) |
| PATCH | `/api/v1/jobs/applications/{id}` | Accept/reject application |
| POST | `/api/v1/jobs/{id}/complete` | Mark completed |
| GET | `/api/v1/jobs/my/posted` | My posted jobs |
| GET | `/api/v1/jobs/my/applications` | My applications |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/chat` | Rojgar Sahayak chatbot |
| POST | `/api/v1/ai/categorize-job` | Auto-categorize from description |
| POST | `/api/v1/ai/suggest-wage` | AI fair daily wage |
| POST | `/api/v1/ai/optimize-profile` | Worker profile suggestions |
| POST | `/api/v1/ai/recommend-workers` | AI-ranked worker matches |

### Other
- Reviews: `POST /api/v1/reviews`, `GET /api/v1/reviews/user/{id}`
- Complaints: `POST /api/v1/complaints`, `GET /api/v1/complaints/me`
- Admin: `/api/v1/admin/*` (users, verify, complaints, analytics)
- Uploads: `POST /api/v1/uploads/image`, `POST /api/v1/uploads/document`

## Deployment (Render)

1. Push to GitHub.
2. On Render: **New → Web Service** → connect repo.
3. **Build command:** `pip install -r requirements.txt`
4. **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Add a managed PostgreSQL** instance on Render; copy the internal URL into `DATABASE_URL` env var.
6. Set all env vars from `.env.example` (use a strong `JWT_SECRET_KEY` and your real `OPENAI_API_KEY`).
7. After first deploy, run migrations from the Render shell:
   ```bash
   alembic upgrade head
   python -m scripts.seed_admin
   ```

## Architecture Notes

- **Layered architecture**: routes → services → models. Routes are thin, services hold business rules, models stay pure SQLAlchemy.
- **Pydantic v2 schemas** separate request, response, and update DTOs. ORM models never leak directly to the API.
- **JWT** uses access + refresh tokens. Access tokens carry role; FastAPI dependencies enforce role-based access.
- **Error handling** is centralized in `middleware/error_handler.py` — every exception returns a consistent JSON shape.
- **AI service** uses OpenAI's structured JSON output for deterministic responses (categorize, wage, profile, recommend) and free-form streaming-style chat for the assistant.
- **Migrations** are autogenerate-friendly; `alembic/env.py` imports all models for full metadata.

## Future SaaS Path (Phase 2/3)

- Multi-tenancy by `tenant_id` foreign key
- Payments: Stripe / Razorpay for subscriptions & per-job fees
- Realtime: WebSocket channel for job feed and chat
- Attendance: QR + geo check-in
- Notifications: FCM (mobile) + email (SendGrid)
- Migrate Render → AWS (ECS Fargate + RDS + S3 + CloudFront)
