from flask import Blueprint, request, jsonify
from db import get_connection
from routes.depenses import get_user_from_token

categories_bp = Blueprint("categories", __name__)

# GET /api/categories - liste des categories du budget actif avec consommation
@categories_bp.route("", methods=["GET"])
def get_categories():
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT c.id_categorie, c.nom_categorie, c.sous_budget, c.couleur,
               COALESCE(SUM(d.montant), 0) as total_depense
        FROM categorie c
        JOIN budget b ON c.id_budget = b.id_budget
        LEFT JOIN depense d ON d.id_categorie = c.id_categorie
        WHERE b.id_utilisateur = %s AND b.statut = 'actif'
        GROUP BY c.id_categorie
    """, (id_user,))
    categories = cursor.fetchall()
    conn.close()

    for c in categories:
        c["sous_budget"] = float(c["sous_budget"])
        c["total_depense"] = float(c["total_depense"])
        c["pourcentage"] = round((c["total_depense"] / c["sous_budget"]) * 100, 1) if c["sous_budget"] > 0 else 0

    return jsonify(categories), 200
