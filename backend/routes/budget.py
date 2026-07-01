from flask import Blueprint, request, jsonify
from db import get_connection
from routes.depenses import get_user_from_token

budget_bp = Blueprint("budget", __name__)

@budget_bp.route("", methods=["GET"])
def get_budget():
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT id_budget, montant_global, periode, date_debut, date_fin, statut
        FROM budget
        WHERE id_utilisateur = %s AND statut = 'actif'
        ORDER BY id_budget DESC LIMIT 1
    """, (id_user,))
    budget = cursor.fetchone()

    if not budget:
        conn.close()
        return jsonify({"erreur": "Aucun budget defini"}), 404

    cursor.execute("""
        SELECT COALESCE(SUM(d.montant), 0) as total_depense
        FROM depense d
        JOIN categorie c ON d.id_categorie = c.id_categorie
        WHERE c.id_budget = %s
    """, (budget["id_budget"],))
    total = cursor.fetchone()["total_depense"]
    conn.close()

    budget["date_debut"] = str(budget["date_debut"])
    budget["date_fin"] = str(budget["date_fin"])
    budget["total_depense"] = float(total)
    budget["solde"] = float(budget["montant_global"]) - float(total)

    return jsonify(budget), 200

@budget_bp.route("", methods=["POST"])
def create_budget():
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    data = request.get_json()
    montant_global = data.get("montant_global")
    periode = data.get("periode", "mensuel")
    date_debut = data.get("date_debut")
    date_fin = data.get("date_fin")

    if not montant_global or float(montant_global) <= 0:
        return jsonify({"erreur": "Le budget global doit etre superieur a 0"}), 400
    if not all([date_debut, date_fin]):
        return jsonify({"erreur": "date_debut et date_fin sont obligatoires"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE budget SET statut = 'archive'
        WHERE id_utilisateur = %s AND statut = 'actif'
    """, (id_user,))

    cursor.execute("""
        INSERT INTO budget (montant_global, periode, date_debut, date_fin, statut, id_utilisateur)
        VALUES (%s, %s, %s, %s, 'actif', %s)
    """, (montant_global, periode, date_debut, date_fin, id_user))
    id_budget = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({"message": "Budget cree avec succes", "id_budget": id_budget}), 201

@budget_bp.route("/<int:id_budget>", methods=["PUT"])
def update_budget(id_budget):
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    data = request.get_json()
    montant_global = data.get("montant_global")

    if montant_global is not None and float(montant_global) <= 0:
        return jsonify({"erreur": "Le budget global doit etre superieur a 0"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id_budget FROM budget WHERE id_budget = %s AND id_utilisateur = %s",
                   (id_budget, id_user))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"erreur": "Budget introuvable"}), 404

    cursor.execute("UPDATE budget SET montant_global = %s WHERE id_budget = %s",
                   (montant_global, id_budget))
    conn.commit()
    conn.close()
    return jsonify({"message": "Budget mis a jour"}), 200

@budget_bp.route("/<int:id_budget>/categories", methods=["POST"])
def repartir_categories(id_budget):
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    data = request.get_json()
    categories = data.get("categories", [])

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT montant_global FROM budget WHERE id_budget = %s AND id_utilisateur = %s",
                   (id_budget, id_user))
    budget = cursor.fetchone()
    if not budget:
        conn.close()
        return jsonify({"erreur": "Budget introuvable"}), 404

    somme = sum(float(c.get("sous_budget", 0)) for c in categories)
    if somme > float(budget["montant_global"]):
        conn.close()
        return jsonify({"erreur": "La somme des sous-budgets depasse le budget global"}), 400

    for cat in categories:
        cursor.execute("""
            INSERT INTO categorie (nom_categorie, sous_budget, couleur, id_budget)
            VALUES (%s, %s, %s, %s)
        """, (cat["nom"], cat.get("sous_budget", 0), cat.get("couleur", "#1B3A5C"), id_budget))

    conn.commit()
    conn.close()
    return jsonify({"message": "Categories enregistrees"}), 201