from flask import Blueprint, request, jsonify
from db import get_connection
from routes.depenses import get_user_from_token
from datetime import datetime

rapports_bp = Blueprint("rapports", __name__)

# GET /api/rapports/donnees?debut=2026-01-01&fin=2026-01-31
@rapports_bp.route("/donnees", methods=["GET"])
def donnees_rapport():
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    debut = request.args.get("debut")
    fin = request.args.get("fin")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    requete = """
    SELECT d.id_depense, d.montant, d.date_depense, d.description,
           c.nom_categorie
    FROM depense d
    JOIN categorie c ON d.id_categorie = c.id_categorie
    JOIN budget b ON c.id_budget = b.id_budget
    WHERE b.id_utilisateur = %s
    """
    params = [id_user]

    if debut and fin:
        requete += " AND d.date_depense BETWEEN %s AND %s"
        params += [debut, fin]

    requete += " ORDER BY d.date_depense DESC"

    cursor.execute(requete, tuple(params))
    depenses = cursor.fetchall()

    total = sum(float(d["montant"]) for d in depenses)

    par_categorie = {}
    for d in depenses:
        nom = d["nom_categorie"]
        par_categorie[nom] = par_categorie.get(nom, 0) + float(d["montant"])
        d["date_depense"] = str(d["date_depense"])

    conn.close()

    return jsonify({
        "depenses": depenses,
        "total": total,
        "par_categorie": par_categorie,
        "periode": {"debut": debut, "fin": fin},
        "genere_le": datetime.now().strftime("%Y-%m-%d %H:%M")
    }), 200