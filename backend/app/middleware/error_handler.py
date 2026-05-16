from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.core.exceptions import AppException
from app.utils.logger import logger


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def handle_app_exception(request: Request, exc: AppException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "detail": exc.detail},
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors = []
        for err in exc.errors():
            errors.append(
                {
                    "field": ".".join(str(loc) for loc in err.get("loc", [])),
                    "message": err.get("msg"),
                    "type": err.get("type"),
                }
            )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "detail": "Validation failed",
                "errors": errors,
            },
        )

    @app.exception_handler(IntegrityError)
    async def handle_integrity_error(
        request: Request, exc: IntegrityError
    ) -> JSONResponse:
        logger.error(f"Integrity error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "success": False,
                "detail": "Database integrity error (likely a duplicate value)",
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def handle_db_error(request: Request, exc: SQLAlchemyError) -> JSONResponse:
        logger.error(f"Database error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "detail": "Internal database error"},
        )

    @app.exception_handler(Exception)
    async def handle_unhandled(request: Request, exc: Exception) -> JSONResponse:
        logger.exception(f"Unhandled exception: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "detail": "Internal server error"},
        )
