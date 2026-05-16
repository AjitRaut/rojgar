from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_root():
    resp = client.get("/")
    assert resp.status_code == 200
    body = resp.json()
    assert "app" in body
    assert "version" in body


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
