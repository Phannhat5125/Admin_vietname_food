"""Flask application entrypoint.

This file now attempts to locate the sibling virtual environment (../.venv)
and prepend its site-packages to sys.path when run with a system Python that
does not have dependencies installed. This lets you simply run:

    python app.py

without manually activating the virtual environment, provided the .venv
directory exists at backend/.venv.

If packages are still missing, create the venv:
    python -m venv ../.venv
    ../.venv/Scripts/pip install -r ../requirements.txt
"""

import sys, os, pathlib

def _ensure_venv_packages():
    """Prepend .venv site-packages paths if core deps (flask/jwt) not found.

    This is a lightweight convenience; activation is still the recommended
    practice for development. Safe because only prepends existing directories.
    """
    try:
        import flask  # noqa: F401
        import jwt    # noqa: F401
        return  # All good; running inside environment with deps.
    except ModuleNotFoundError:
        pass

    project_root = pathlib.Path(__file__).resolve().parents[1]  # backend/food_api -> backend
    venv_root = project_root / '.venv'

    # Common Windows & POSIX site-packages locations inside venv
    candidates = []
    # Windows layout
    candidates.append(venv_root / 'Lib' / 'site-packages')
    # POSIX layout (in case of WSL or different tooling)
    candidates.append(venv_root / 'lib' / f'python{sys.version_info.major}.{sys.version_info.minor}' / 'site-packages')

    injected = False
    for p in candidates:
        if p.exists() and str(p) not in sys.path:
            sys.path.insert(0, str(p))
            injected = True

    if injected:
        try:
            import flask  # noqa: F401
            import jwt    # noqa: F401
        except ModuleNotFoundError:
            # Provide a clearer hint for the user.
            print("[WARN] Dependencies still missing. Install with: .venv\\Scripts\\pip install -r ../requirements.txt")
    else:
        # Silent if no venv; user may be intentionally using global env.
        pass

_ensure_venv_packages()

from flask import Flask
from routes.mon_an_routes import mon_an_bp
from routes.auth_routes import auth_bp
from flask_cors import CORS

app = Flask(__name__)

# Allow CORS for development frontend (Vite default port 5173); configurable via ENV
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
CORS(app, resources={r"/*": {"origins": [frontend_origin]}})

app.register_blueprint(mon_an_bp)
app.register_blueprint(auth_bp)

if __name__ == "__main__":
    # Host 0.0.0.0 để có thể truy cập từ máy khác trong LAN nếu cần
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
