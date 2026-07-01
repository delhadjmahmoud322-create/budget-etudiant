from flask import Flask, jsonify
from flask_cors import CORS
from db import get_connection
from routes.auth import auth_bp
from routes.depenses import depenses_bp
from routes.budget import budget_bp
from routes.rapports import rapports_bp
from routes.categories import categories_bp
from routes.dashboard import dashboard_bp
from routes.alertes import alertes_bp
from routes.historique import historique_bp
from routes.planification import planification_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(auth_bp,           url_prefix="/api/auth")
app.register_blueprint(depenses_bp,       url_prefix="/api/depenses")
app.register_blueprint(budget_bp,         url_prefix="/api/budget")
app.register_blueprint(rapports_bp,       url_prefix="/api/rapports")
app.register_blueprint(categories_bp,     url_prefix="/api/categories")
app.register_blueprint(dashboard_bp,      url_prefix="/api/dashboard")
app.register_blueprint(alertes_bp,        url_prefix="/api/alertes")
app.register_blueprint(historique_bp,     url_prefix="/api/historique")
app.register_blueprint(planification_bp,  url_prefix="/api/planification")

@app.route("/api/test")
def test():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM utilisateur")
    count = cursor.fetchone()[0]
    conn.close()
    return jsonify({
        "message": "Flask connecte a MySQL !",
        "utilisateurs": count,
        "routes_actives": [
            "/api/auth", "/api/depenses", "/api/budget",
            "/api/categories", "/api/dashboard", "/api/alertes",
            "/api/historique", "/api/rapports", "/api/planification"
        ]
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)