import json
from typing import List, Optional
from openai import OpenAI, OpenAIError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import BadRequestError
from app.models.user import User, UserRole
from app.models.worker import WorkerProfile
from app.schemas.ai import (
    ChatRequest,
    ChatResponse,
    JobCategorizeRequest,
    JobCategorizeResponse,
    ProfileOptimizeRequest,
    ProfileOptimizeResponse,
    RecommendedWorker,
    WageSuggestRequest,
    WageSuggestResponse,
    WorkerRecommendRequest,
    WorkerRecommendResponse,
)
from app.utils.logger import logger


SYSTEM_PROMPT_CHAT = (
    "You are Rojgar Sahayak, the helpful AI assistant for Rojgar Find, "
    "an Indian platform that connects customers and companies with local skilled "
    "workers like plumbers, electricians, carpenters, painters, and daily wage laborers. "
    "Answer concisely in the user's language (English, Hindi, or Marathi). "
    "Help users find workers, post jobs, understand pricing, and resolve issues. "
    "Stay friendly, practical, and never give legal/medical advice."
)


def _safe_parse_json(content: Optional[str], fallback: dict) -> dict:
    """Safely parse JSON string; return fallback on any error."""
    if not content or not content.strip():
        return fallback
    # Strip accidental markdown code fences
    text = content.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1]) if len(lines) > 2 else text
    try:
        return json.loads(text)
    except (json.JSONDecodeError, ValueError) as e:
        logger.warning(f"JSON parse failed: {e} | raw: {content[:200]}")
        return fallback


class AIService:
    def __init__(self, db: Session):
        self.db = db
        self._client: Optional[OpenAI] = None

    @property
    def client(self) -> OpenAI:
        if self._client is None:
            if not settings.OPENAI_API_KEY:
                raise BadRequestError("OpenAI API key is not configured. Set OPENAI_API_KEY in .env")
            self._client = OpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    # ── Chat ─────────────────────────────────────────────────────────────────

    def chat(self, payload: ChatRequest) -> ChatResponse:
        messages: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT_CHAT}]
        for m in payload.history[-10:]:
            if m.role in ("user", "assistant", "system"):
                messages.append({"role": m.role, "content": m.content})
        messages.append({"role": "user", "content": payload.message})

        try:
            completion = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                temperature=0.6,
                max_tokens=500,
            )
            choice = completion.choices[0] if completion.choices else None
            reply = (choice.message.content or "").strip() if choice else ""
            if not reply:
                reply = "I'm sorry, I couldn't generate a response. Please try again."
            return ChatResponse(reply=reply, model=settings.OPENAI_MODEL)
        except OpenAIError as e:
            logger.error(f"OpenAI chat error: {e}")
            raise BadRequestError(f"AI service error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected chat error: {e}")
            raise BadRequestError("AI service temporarily unavailable. Please try again.")

    # ── Categorize Job ────────────────────────────────────────────────────────

    def categorize_job(self, payload: JobCategorizeRequest) -> JobCategorizeResponse:
        system = (
            "You categorize labor job descriptions. Return STRICT JSON only, no markdown, "
            "no commentary. Schema: "
            '{"category": string, "suggested_skills": [string], "suggested_title": string}. '
            "Category must be one of: Plumbing, Electrical, Carpentry, Painting, "
            "Masonry, Cleaning, Loading, Electronics Repair, Gardening, Cooking, "
            "Driving, Security, Tailoring, General Labor."
        )
        fallback = {
            "category": "General Labor",
            "suggested_skills": [],
            "suggested_title": payload.description[:60],
        }
        try:
            completion = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": payload.description},
                ],
                temperature=0.2,
                response_format={"type": "json_object"},
                max_tokens=300,
            )
            content = completion.choices[0].message.content if completion.choices else None
            data = _safe_parse_json(content, fallback)
            return JobCategorizeResponse(
                category=str(data.get("category") or "General Labor"),
                suggested_skills=[str(s) for s in (data.get("suggested_skills") or [])],
                suggested_title=str(data.get("suggested_title") or payload.description[:60]),
            )
        except OpenAIError as e:
            logger.error(f"Categorize job OpenAI error: {e}")
            raise BadRequestError(f"AI service error: {str(e)}")
        except Exception as e:
            logger.error(f"Categorize job unexpected error: {e}")
            # Graceful fallback instead of crashing
            return JobCategorizeResponse(
                category=fallback["category"],
                suggested_skills=fallback["suggested_skills"],
                suggested_title=fallback["suggested_title"],
            )

    # ── Suggest Wage ──────────────────────────────────────────────────────────

    def suggest_wage(self, payload: WageSuggestRequest) -> WageSuggestResponse:
        system = (
            "You are a wage advisor for Indian daily-wage and skilled labor in INR. "
            "Given a skill, city, and years of experience, suggest a fair daily wage. "
            "Return STRICT JSON only with schema: "
            '{"suggested_daily_wage": number, "min_wage": number, "max_wage": number, "reasoning": string}. '
            "Base ranges roughly: unskilled 350-650, semi-skilled 500-900, skilled 700-1500, "
            "highly experienced 1000-2500. Metro cities pay 15-25% more. "
            "All values must be positive numbers."
        )
        user_msg = (
            f"Skill: {payload.skill}\n"
            f"City: {payload.city}\n"
            f"Experience years: {payload.experience_years}"
        )
        fallback = {
            "suggested_daily_wage": 600,
            "min_wage": 400,
            "max_wage": 1000,
            "reasoning": "Default estimate (AI unavailable).",
        }
        try:
            completion = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_msg},
                ],
                temperature=0.3,
                response_format={"type": "json_object"},
                max_tokens=300,
            )
            content = completion.choices[0].message.content if completion.choices else None
            data = _safe_parse_json(content, fallback)

            suggested = float(data.get("suggested_daily_wage") or fallback["suggested_daily_wage"])
            min_w = float(data.get("min_wage") or fallback["min_wage"])
            max_w = float(data.get("max_wage") or fallback["max_wage"])

            # Sanity checks
            if min_w <= 0:
                min_w = suggested * 0.7
            if max_w <= suggested:
                max_w = suggested * 1.5

            return WageSuggestResponse(
                suggested_daily_wage=suggested,
                min_wage=min_w,
                max_wage=max_w,
                reasoning=str(data.get("reasoning") or ""),
            )
        except OpenAIError as e:
            logger.error(f"Wage suggest OpenAI error: {e}")
            raise BadRequestError(f"AI service error: {str(e)}")
        except Exception as e:
            logger.error(f"Wage suggest unexpected error: {e}")
            return WageSuggestResponse(
                suggested_daily_wage=fallback["suggested_daily_wage"],
                min_wage=fallback["min_wage"],
                max_wage=fallback["max_wage"],
                reasoning=fallback["reasoning"],
            )

    # ── Optimize Profile ──────────────────────────────────────────────────────

    def optimize_profile(self, payload: ProfileOptimizeRequest) -> ProfileOptimizeResponse:
        system = (
            "You optimize worker profiles on a hiring platform. Suggest concrete profile "
            "improvements and write a polished bio. Return STRICT JSON only: "
            '{"suggestions": [string], "improved_bio": string}. '
            "Keep the bio under 80 words, professional, in simple English. "
            "Provide 3-5 actionable suggestions."
        )
        user_msg = (
            f"Current bio: {payload.bio or '(empty)'}\n"
            f"Skills: {', '.join(payload.skills) if payload.skills else '(none)'}\n"
            f"Experience years: {payload.experience_years}"
        )
        fallback = {
            "suggestions": ["Add a bio describing your experience.", "List all your skills."],
            "improved_bio": "",
        }
        try:
            completion = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_msg},
                ],
                temperature=0.6,
                response_format={"type": "json_object"},
                max_tokens=500,
            )
            content = completion.choices[0].message.content if completion.choices else None
            data = _safe_parse_json(content, fallback)
            return ProfileOptimizeResponse(
                suggestions=[str(s) for s in (data.get("suggestions") or [])] or fallback["suggestions"],
                improved_bio=str(data.get("improved_bio") or ""),
            )
        except OpenAIError as e:
            logger.error(f"Profile optimize OpenAI error: {e}")
            raise BadRequestError(f"AI service error: {str(e)}")
        except Exception as e:
            logger.error(f"Profile optimize unexpected error: {e}")
            return ProfileOptimizeResponse(
                suggestions=fallback["suggestions"],
                improved_bio=fallback["improved_bio"],
            )

    # ── Recommend Workers ─────────────────────────────────────────────────────

    def recommend_workers(self, payload: WorkerRecommendRequest) -> WorkerRecommendResponse:
        query = (
            self.db.query(WorkerProfile, User)
            .join(User, WorkerProfile.user_id == User.id)
            .filter(User.role == UserRole.WORKER, User.is_active.is_(True))
        )
        if payload.city:
            query = query.filter(WorkerProfile.city.ilike(f"%{payload.city}%"))
        if payload.skill:
            from sqlalchemy import cast, String, or_
            query = query.filter(
                or_(
                    WorkerProfile.primary_skill.ilike(f"%{payload.skill}%"),
                    cast(WorkerProfile.skills, String).ilike(f"%{payload.skill}%"),
                )
            )

        candidates = query.limit(50).all()
        if not candidates:
            return WorkerRecommendResponse(workers=[])

        candidate_list = [
            {
                "worker_id": user.id,
                "name": user.full_name,
                "primary_skill": p.primary_skill or "",
                "skills": p.skills or [],
                "experience_years": p.experience_years,
                "city": p.city or "",
                "rating": float(p.rating_avg),
                "completed_jobs": p.total_jobs_completed,
                "daily_rate": float(p.daily_rate) if p.daily_rate else None,
            }
            for p, user in candidates
        ]

        system = (
            "You rank workers for a job request. Return STRICT JSON only with schema: "
            '{"workers": [{"worker_id": number, "match_score": number, "match_reason": string}]}. '
            "match_score is 0-100. Rank by skill match, location, rating, experience. "
            f"Return at most {payload.limit} workers, best first."
        )
        user_msg = (
            f"Job description: {payload.job_description}\n"
            f"Preferred city: {payload.city or 'any'}\n"
            f"Preferred skill: {payload.skill or 'any'}\n\n"
            f"Candidates: {json.dumps(candidate_list)}"
        )

        ranked: list[dict] = []
        try:
            completion = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_msg},
                ],
                temperature=0.3,
                response_format={"type": "json_object"},
                max_tokens=1000,
            )
            content = completion.choices[0].message.content if completion.choices else None
            data = _safe_parse_json(content, {"workers": []})
            ranked = data.get("workers") or []
            if not isinstance(ranked, list):
                ranked = []
        except OpenAIError as e:
            logger.error(f"Recommend workers OpenAI error: {e}")
        except Exception as e:
            logger.error(f"Recommend workers unexpected error: {e}")

        # Fallback: rank by rating if AI failed or returned nothing
        if not ranked:
            logger.info("Using rating-based fallback for worker recommendations")
            ranked = [
                {
                    "worker_id": c["worker_id"],
                    "match_score": round(min(c["rating"] / 5.0 * 100, 100), 1),
                    "match_reason": "Ranked by rating (AI unavailable)",
                }
                for c in sorted(candidate_list, key=lambda x: -x["rating"])[: payload.limit]
            ]

        lookup = {c["worker_id"]: c for c in candidate_list}
        result: List[RecommendedWorker] = []
        for r in ranked[: payload.limit]:
            wid = r.get("worker_id")
            if not isinstance(wid, int):
                continue
            base = lookup.get(wid)
            if not base:
                continue
            match_score = float(r.get("match_score") or 0)
            match_score = max(0.0, min(100.0, match_score))  # clamp 0-100
            result.append(
                RecommendedWorker(
                    worker_id=wid,
                    full_name=base["name"],
                    primary_skill=base["primary_skill"] or None,
                    city=base["city"] or None,
                    rating_avg=base["rating"],
                    match_score=match_score,
                    match_reason=str(r.get("match_reason") or ""),
                )
            )
        return WorkerRecommendResponse(workers=result)