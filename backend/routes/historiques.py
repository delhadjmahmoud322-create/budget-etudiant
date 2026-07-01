from flask import Blueprint, request, jsonify
from db import get_connection
from routes.depenses import get_user_from_token

historique_bp = Blueprint("historique", __name__)

# GET /api/historique?debut=2026-01-01&fin=2026-01-31&id_categorie=3
@historique_bp.route("", methods=["GET"])
def get_historique():
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    debut = request.args.get("debut")
    fin = request.args.get("fin")
    id_categorie = request.args.get("id_categorie")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    requete = """
        SELECT h.id_historique, h.action, h.details, h.date_action,
               d.montant, d.date_depense, d.description,
               c.nom_categorie, c.id_categorie
        FROM historique h
        LEFT JOIN depense d ON h.id_depense = d.id_depense
        LEFT JOIN categorie c ON d.id_categorie = c.id_categorie
        WHERE h.id_utilisateur = %s
    """
    params = [id_user]

    if debut:
        requete += " AND DATE(h.date_action) >= %s"
        params.append(debut)
    if fin:
        requete += " AND DATE(h.date_action) <= %s"
        params.append(fin)
    if id_categorie:
        requete += " AND c.id_categorie = %s"
        params.append(id_categorie)

    requete += " ORDER BY h.date_action DESC LIMIT 200"
    cursor.execute(requete, tuple(params))
    historique = cursor.fetchall()
    conn.close()

    for h in historique:
        h["date_action"] = str(h["date_action"])
        if h["date_depense"]:
            h["date_depense"] = str(h["date_depense"])
        if h["montant"]:
            h["montant"] = float(h["montant"])

    return jsonify(historique), 200
