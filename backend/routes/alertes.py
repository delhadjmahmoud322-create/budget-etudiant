from flask import Blueprint, request, jsonify
from db import get_connection
from routes.depenses import get_user_from_token

alertes_bp = Blueprint("alertes", __name__)

# GET /api/alertes - liste des alertes non lues de l'utilisateur
@alertes_bp.route("", methods=["GET"])
def get_alertes():
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT a.id_alerte, a.type_alerte, a.message, a.pourcentage_atteint,
               c.nom_categorie, n.id_notification, n.lue
        FROM alerte a
        JOIN budget b ON a.id_budget = b.id_budget
        LEFT JOIN categorie c ON a.id_categorie = c.id_categorie
        LEFT JOIN notification n ON n.id_alerte = a.id_alerte
        WHERE b.id_utilisateur = %s
        ORDER BY a.id_alerte DESC
    """, (id_user,))
    alertes = cursor.fetchall()
    conn.close()
    return jsonify(alertes), 200

# PUT /api/alertes/<id>/lue - marquer une notification comme lue
@alertes_bp.route("/<int:id_notification>/lue", methods=["PUT"])
def marquer_lue(id_notification):
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notification SET lue = 1 WHERE id_notification = %s", (id_notification,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Notification marquee comme lue"}), 200
