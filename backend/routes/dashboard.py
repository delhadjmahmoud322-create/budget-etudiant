from flask import Blueprint, request, jsonify
from db import get_connection
from routes.depenses import get_user_from_token

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("", methods=["GET"])
def get_dashboard():
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id_budget, montant_global FROM budget
        WHERE id_utilisateur = %s AND statut = 'actif' LIMIT 1
    """, (id_user,))
    budget = cursor.fetchone()
    if not budget:
        conn.close()
        return jsonify({"erreur": "Aucun budget actif"}), 404

    # Repartition par categorie (pour le graphique camembert)
    cursor.execute("""
        SELECT c.nom_categorie, c.couleur, COALESCE(SUM(d.montant), 0) as total
        FROM categorie c
        LEFT JOIN depense d ON d.id_categorie = c.id_categorie
        WHERE c.id_budget = %s
        GROUP BY c.id_categorie
    """, (budget["id_budget"],))
    repartition = cursor.fetchall()
    for r in repartition:
        r["total"] = float(r["total"])

    total_depense = sum(r["total"] for r in repartition)

    # Evolution des 7 derniers jours (pour le graphique courbe)
    cursor.execute("""
        SELECT d.date_depense, SUM(d.montant) as total_jour
        FROM depense d
        JOIN categorie c ON d.id_categorie = c.id_categorie
        WHERE c.id_budget = %s
        GROUP BY d.date_depense
        ORDER BY d.date_depense ASC
        LIMIT 30
    """, (budget["id_budget"],))
    evolution = cursor.fetchall()
    for e in evolution:
        e["date_depense"] = str(e["date_depense"])
        e["total_jour"] = float(e["total_jour"])

    conn.close()

    return jsonify({
        "budget_global": float(budget["montant_global"]),
        "total_depense": total_depense,
        "solde": float(budget["montant_global"]) - total_depense,
        "repartition_categories": repartition,
        "evolution": evolution
    }), 200
