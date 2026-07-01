from flask import Blueprint, request, jsonify
from db import get_connection
from routes.depenses import get_user_from_token

planification_bp = Blueprint("planification", __name__)

# GET /api/planification - liste des planifications
@planification_bp.route("", methods=["GET"])
def get_planifications():
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.id_planification, p.montant_prevu, p.date_prevue,
               p.description, p.statut, p.recurrent,
               c.nom_categorie, c.couleur
        FROM planification_depense p
        JOIN categorie c ON p.id_categorie = c.id_categorie
        JOIN budget b ON c.id_budget = b.id_budget
        WHERE b.id_utilisateur = %s
        ORDER BY p.date_prevue ASC
    """, (id_user,))
    planifications = cursor.fetchall()
    conn.close()

    for p in planifications:
        p["date_prevue"] = str(p["date_prevue"])

    return jsonify(planifications), 200

# POST /api/planification - creer une planification
@planification_bp.route("", methods=["POST"])
def create_planification():
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    data = request.get_json()
    montant_prevu  = data.get("montant_prevu")
    date_prevue    = data.get("date_prevue")
    description    = data.get("description", "")
    id_categorie   = data.get("id_categorie")
    recurrent      = data.get("recurrent", 0)

    if not all([montant_prevu, date_prevue, id_categorie]):
        return jsonify({"erreur": "montant_prevu, date_prevue et id_categorie sont obligatoires"}), 400
    if float(montant_prevu) <= 0:
        return jsonify({"erreur": "Le montant doit etre superieur a 0"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Verifier que la categorie appartient a l'utilisateur
    cursor.execute("""
        SELECT c.id_categorie FROM categorie c
        JOIN budget b ON c.id_budget = b.id_budget
        WHERE c.id_categorie = %s AND b.id_utilisateur = %s
    """, (id_categorie, id_user))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"erreur": "Categorie non autorisee"}), 403

    cursor.execute("""
        INSERT INTO planification_depense
        (montant_prevu, date_prevue, description, statut, recurrent, id_categorie)
        VALUES (%s, %s, %s, 'prevu', %s, %s)
    """, (montant_prevu, date_prevue, description, recurrent, id_categorie))
    id_plan = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({"message": "Planification creee", "id_planification": id_plan}), 201

# PUT /api/planification/<id> - modifier une planification
@planification_bp.route("/<int:id_plan>", methods=["PUT"])
def update_planification(id_plan):
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    data = request.get_json()
    montant_prevu = data.get("montant_prevu")
    date_prevue   = data.get("date_prevue")
    description   = data.get("description")
    statut        = data.get("statut")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT p.id_planification FROM planification_depense p
        JOIN categorie c ON p.id_categorie = c.id_categorie
        JOIN budget b ON c.id_budget = b.id_budget
        WHERE p.id_planification = %s AND b.id_utilisateur = %s
    """, (id_plan, id_user))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"erreur": "Planification introuvable"}), 404

    cursor.execute("""
        UPDATE planification_depense
        SET montant_prevu = COALESCE(%s, montant_prevu),
            date_prevue   = COALESCE(%s, date_prevue),
            description   = COALESCE(%s, description),
            statut        = COALESCE(%s, statut)
        WHERE id_planification = %s
    """, (montant_prevu, date_prevue, description, statut, id_plan))
    conn.commit()
    conn.close()
    return jsonify({"message": "Planification mise a jour"}), 200

# DELETE /api/planification/<id> - supprimer une planification
@planification_bp.route("/<int:id_plan>", methods=["DELETE"])
def delete_planification(id_plan):
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT p.id_planification FROM planification_depense p
        JOIN categorie c ON p.id_categorie = c.id_categorie
        JOIN budget b ON c.id_budget = b.id_budget
        WHERE p.id_planification = %s AND b.id_utilisateur = %s
    """, (id_plan, id_user))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"erreur": "Planification introuvable"}), 404

    cursor.execute("DELETE FROM planification_depense WHERE id_planification = %s", (id_plan,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Planification supprimee"}), 200