"""API tests for the non-AI surface (CRUD, notes, cascade, stats).

The AI endpoints (/ai/*) call Claude and are exercised manually via
`claude_smoke.py`; these tests cover the deterministic core with SQLite.
Run from the backend/ dir:  pytest -q
"""
import pytest
from fastapi.testclient import TestClient

from database import Base, engine, get_db  # noqa: E402
from main import app  # noqa: E402


@pytest.fixture(autouse=True)
def _fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture()
def client():
    return TestClient(app)


def _make_book(client, title="Dune", author="Frank Herbert", status="want_to_read", rating=None):
    resp = client.post(
        "/books",
        json={"title": title, "author": author, "status": status, "rating": rating},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def test_health(client):
    body = client.get("/health").json()
    assert body["status"] == "ok"


def test_create_and_read_book(client):
    book = _make_book(client)
    assert book["title"] == "Dune"
    got = client.get(f"/books/{book['id']}").json()
    assert got["author"] == "Frank Herbert"


def test_get_missing_book_404(client):
    assert client.get("/books/9999").status_code == 404


def test_list_filter_by_status(client):
    _make_book(client, title="A", status="read", rating=5)
    _make_book(client, title="B", status="want_to_read")
    read = client.get("/books?status=read").json()
    assert len(read) == 1 and read[0]["title"] == "A"


def test_update_book_status_and_rating(client):
    book = _make_book(client)
    resp = client.put(f"/books/{book['id']}", json={"status": "read", "rating": 5})
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["status"] == "read" and updated["rating"] == 5


def test_delete_book(client):
    book = _make_book(client)
    assert client.delete(f"/books/{book['id']}").status_code == 200
    assert client.get(f"/books/{book['id']}").status_code == 404


def test_stats_aggregates(client):
    _make_book(client, title="A", status="read", rating=4)
    _make_book(client, title="B", status="read", rating=2)
    _make_book(client, title="C", status="want_to_read")
    stats = client.get("/books/stats").json()
    assert stats["total"] == 3


def test_notes_crud_and_cascade_delete(client):
    book = _make_book(client)
    # add two notes
    n1 = client.post(f"/books/{book['id']}/notes", json={"content": "Great opening", "page_number": 1})
    assert n1.status_code == 201, n1.text
    client.post(f"/books/{book['id']}/notes", json={"content": "Spice must flow"})

    notes = client.get(f"/books/{book['id']}/notes").json()
    assert len(notes) == 2

    # deleting the book must cascade-delete its notes
    assert client.delete(f"/books/{book['id']}").status_code == 200
    assert client.get(f"/books/{book['id']}/notes").status_code == 404
