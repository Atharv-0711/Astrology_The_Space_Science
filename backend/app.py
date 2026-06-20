"""Local development launcher.

Run from the backend directory:
    python app.py
"""

import uvicorn


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
