from backend.app import create_app
import threading
import time
import webbrowser

app = create_app()
URL = "http://127.0.0.1:5000/"

def _open_browser() -> None:
    time.sleep(1.0)
    try:
        webbrowser.open(URL)
    except Exception:
        pass

if __name__ == "__main__":
    threading.Thread(target=_open_browser, daemon=True).start()
    app.run(host="127.0.0.1", port=5000, debug=True, use_reloader=False)
