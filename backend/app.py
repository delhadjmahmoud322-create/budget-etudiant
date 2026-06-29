from flask import Flask, jsonify
from flask_cors import CORS
from db import get_connection
from routes.auth import auth_bp
from routes.depenses import depenses_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(depenses_bp, url_prefix="/api/depenses")

@app.route("/api/test")
def test():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM utilisateur")
    count = cursor.fetchone()[0]
    conn.close()
    return jsonify({
        "message": "Flask connecte a MySQL !",
        "utilisateurs": count
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)