"""Test bootstrap: point the app at a throwaway SQLite DB and a dummy API key
*before* `database`/`main` are imported, so tests need neither Postgres nor a
real Anthropic key. `load_dotenv(override=False)` won't clobber these.
"""
import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key-not-used")
_tmp = tempfile.mkdtemp(prefix="btai-test-")
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
