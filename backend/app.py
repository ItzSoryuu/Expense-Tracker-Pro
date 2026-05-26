import os
from flask import Flask, send_from_directory

from backend.routes.transactions import transactions_bp
from backend.routes.statistics import statistics_bp
from backend.routes.health import health_bp
from backend.routes.theme import theme_bp

def create_app() -> Flask:
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.abspath(os.path.join(root_dir, "../frontend"))

    # Jangan map static ke "/" ya biar gak ganggu route index
    app = Flask(__name__, static_folder=frontend_dir, static_url_path="/static")

    # Pastiin folder data udah dibikin
    os.makedirs(os.path.join(app.root_path, "database"), exist_ok=True)

    css_dir = os.path.join(frontend_dir, "css")
    js_dir = os.path.join(frontend_dir, "js")

    # Sajikan file statis secara eksplisit biar gak ketimpa sama fallback HTML SPA.
    @app.route("/css/<path:filename>", methods=["GET"])
    def serve_css(filename: str):
        return send_from_directory(css_dir, filename)

    @app.route("/js/<path:filename>", methods=["GET"])
    def serve_js(filename: str):
        return send_from_directory(js_dir, filename)

    # Sajikan favicon kalo emang ada (opsional)
    @app.route("/favicon.ico", methods=["GET"])
    def serve_favicon():
        ico_path = os.path.join(frontend_dir, "assets", "favicon.ico")
        if os.path.isfile(ico_path):
            return send_from_directory(os.path.join(frontend_dir, "assets"), "favicon.ico")
        return "", 204

    # Entrypoint SPA (termasuk HEAD gara-gara curl -I)
    @app.route("/", methods=["GET", "HEAD"])
    def index():
        return send_from_directory(frontend_dir, "index.html")

    # Fallback SPA: buat route "page" yang gak dikenal, balikin index.html aja
    # tapi jangan sampe ngeganggu request API atau asset ya.
    from flask import request

    @app.errorhandler(404)
    def not_found(_err):
        path = request.path or ""
        if path.startswith("/api/"):
            return "Not Found", 404

        # Kalo request asset-nya punya ekstensi, biarin aja 404
        if "." in path.rsplit("/", 1)[-1]:
            return "Not Found", 404

        index_path = os.path.join(frontend_dir, "index.html")
        if os.path.isfile(index_path):
            return send_from_directory(frontend_dir, "index.html")
        return "Not Found", 404

    # Route buat API
    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(theme_bp, url_prefix="/api/theme")
    app.register_blueprint(transactions_bp, url_prefix="/api/transactions")
    app.register_blueprint(statistics_bp, url_prefix="/api/statistics")

    return app
