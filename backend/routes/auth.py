from flask import Blueprint, request, jsonify
import bcrypt, jwt, datetime
from db import get_connection
from config import SECRET_KEY

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/inscription", methods=["POST"])
def inscription():
    data = request.get_json()
    nom = data.get("nom")
    prenom = data.get("prenom")
    email = data.get("email")
    mdp = data.get("mot_de_passe")

    if not all([nom, prenom, email, mdp]):
        return jsonify({"erreur": "Tous les champs sont obligatoires"}), 400

    hash_mdp = bcrypt.hashpw(mdp.encode("utf-8"), bcrypt.gensalt())

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO utilisateur (nom, prenom, email, mot_de_passe_hash) VALUES (%s, %s, %s, %s)",
            (nom, prenom, email, hash_mdp)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Compte cree"}), 201
    except:
        return jsonify({"erreur": "Email deja utilise"}), 409


@auth_bp.route("/connexion", methods=["POST"])
def connexion():
    data = request.get_json()
    email = data.get("email")
    mdp = data.get("mot_de_passe")

    if not email or not mdp:
        return jsonify({"erreur": "Email et mot de passe requis"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM utilisateur WHERE email=%s", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"erreur": "Email introuvable"}), 401

    if not bcrypt.checkpw(
        mdp.encode("utf-8"),
        user["mot_de_passe_hash"].encode("utf-8")
    ):
        return jsonify({"erreur": "Mot de passe incorrect"}), 401

    if not user["est_actif"]:
        return jsonify({"erreur": "Compte desactive"}), 403

    token = jwt.encode({
        "id_utilisateur": user["id_utilisateur"],
        "email": user["email"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }, SECRET_KEY, algorithm="HS256")

    return jsonify({
        "token": token,
        "nom": user["nom"],
        "prenom": user["prenom"]
    }), 200