from flask import Blueprint, request, jsonify
import jwt
from db import get_connection
from config import SECRET_KEY

depenses_bp = Blueprint("depenses", __name__)

# ── Verification du token JWT ─────────────────────────────────
def get_user_from_token(request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return None
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return data["id_utilisateur"]
    except:
        return None

# ── GET /api/depenses ─────────────────────────────────────────
@depenses_bp.route("", methods=["GET"])
def get_depenses():
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT d.id_depense, d.montant, d.date_depense,
               d.description, d.statut, d.date_modification,
               c.nom_categorie, c.couleur
        FROM depense d
        JOIN categorie c ON d.id_categorie = c.id_categorie
        JOIN budget b    ON c.id_budget    = b.id_budget
        WHERE b.id_utilisateur = %s
        ORDER BY d.date_depense DESC
    """, (id_user,))
    depenses = cursor.fetchall()
    conn.close()

    # Convertir les dates en string
    for d in depenses:
        d["date_depense"]     = str(d["date_depense"])
        d["date_modification"] = str(d["date_modification"])

    return jsonify(depenses), 200

# ── POST /api/depenses ────────────────────────────────────────
@depenses_bp.route("", methods=["POST"])
def add_depense():
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    data         = request.get_json()
    montant      = data.get("montant")
    date_depense = data.get("date_depense")
    description  = data.get("description", "")
    id_categorie = data.get("id_categorie")

    if not all([montant, date_depense, id_categorie]):
        return jsonify({"erreur": "montant, date et categorie sont obligatoires"}), 400
    if float(montant) <= 0:
        return jsonify({"erreur": "Le montant doit etre superieur a 0"}), 400

    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Verifier que la categorie appartient au budget de cet utilisateur
    cursor.execute("""
        SELECT c.id_categorie FROM categorie c
        JOIN budget b ON c.id_budget = b.id_budget
        WHERE c.id_categorie = %s AND b.id_utilisateur = %s
    """, (id_categorie, id_user))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"erreur": "Categorie non autorisee"}), 403

    # Inserer la depense
    cursor.execute("""
        INSERT INTO depense (montant, date_depense, description, id_categorie)
        VALUES (%s, %s, %s, %s)
    """, (montant, date_depense, description, id_categorie))
    id_depense = cursor.lastrowid

    # Enregistrer dans l historique
    cursor.execute("""
        INSERT INTO historique (action, details, id_utilisateur, id_depense)
        VALUES ('ajout', %s, %s, %s)
    """, (f"Ajout depense : {description} ({montant} FCFA)", id_user, id_depense))

    conn.commit()

    # Verifier les seuils RG06 et RG07
    cursor.execute("""
        SELECT SUM(d.montant) as total, c.sous_budget, c.nom_categorie
        FROM depense d
        JOIN categorie c ON d.id_categorie = c.id_categorie
        WHERE d.id_categorie = %s
    """, (id_categorie,))
    row = cursor.fetchone()

    alerte = None
    if row and row["sous_budget"] and row["sous_budget"] > 0:
        pct = (float(row["total"]) / float(row["sous_budget"])) * 100
        if pct >= 80:
            type_alerte = "rouge" if pct >= 100 else "orange"
            msg = f"Vous avez consomme {pct:.1f}% de votre budget {row['nom_categorie']}"
            cursor.execute("""
                INSERT INTO alerte (type_alerte, message, pourcentage_atteint, id_budget, id_categorie)
                SELECT %s, %s, %s, b.id_budget, %s
                FROM categorie c JOIN budget b ON c.id_budget = b.id_budget
                WHERE c.id_categorie = %s
            """, (type_alerte, msg, pct, id_categorie, id_categorie))
            conn.commit()
            alerte = {"type": type_alerte, "message": msg, "pourcentage": round(pct, 1)}

    conn.close()
    return jsonify({
        "message"   : "Depense ajoutee avec succes",
        "id_depense": id_depense,
        "alerte"    : alerte
    }), 201

# ── PUT /api/depenses/<id> ────────────────────────────────────
@depenses_bp.route("/<int:id_depense>", methods=["PUT"])
def update_depense(id_depense):
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    data        = request.get_json()
    montant     = data.get("montant")
    description = data.get("description")

    if montant and float(montant) <= 0:
        return jsonify({"erreur": "Le montant doit etre superieur a 0"}), 400

    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Verifier que la depense appartient a cet utilisateur
    cursor.execute("""
        SELECT d.id_depense FROM depense d
        JOIN categorie c ON d.id_categorie = c.id_categorie
        JOIN budget b    ON c.id_budget    = b.id_budget
        WHERE d.id_depense = %s AND b.id_utilisateur = %s
    """, (id_depense, id_user))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"erreur": "Depense introuvable ou non autorisee"}), 404

    # Mettre a jour
    cursor.execute("""
        UPDATE depense
        SET montant = COALESCE(%s, montant),
            description = COALESCE(%s, description)
        WHERE id_depense = %s
    """, (montant, description, id_depense))

    cursor.execute("""
        INSERT INTO historique (action, details, id_utilisateur, id_depense)
        VALUES ('modification', %s, %s, %s)
    """, (f"Modification depense ID {id_depense}", id_user, id_depense))

    conn.commit()
    conn.close()
    return jsonify({"message": "Depense modifiee avec succes"}), 200

# ── DELETE /api/depenses/<id> ─────────────────────────────────
@depenses_bp.route("/<int:id_depense>", methods=["DELETE"])
def delete_depense(id_depense):
    id_user = get_user_from_token(request)
    if not id_user:
        return jsonify({"erreur": "Non autorise"}), 401

    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Verifier que la depense appartient a cet utilisateur
    cursor.execute("""
        SELECT d.id_depense FROM depense d
        JOIN categorie c ON d.id_categorie = c.id_categorie
        JOIN budget b    ON c.id_budget    = b.id_budget
        WHERE d.id_depense = %s AND b.id_utilisateur = %s
    """, (id_depense, id_user))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"erreur": "Depense introuvable ou non autorisee"}), 404

    cursor.execute("""
        INSERT INTO historique (action, details, id_utilisateur, id_depense)
        VALUES ('suppression', %s, %s, %s)
    """, (f"Suppression depense ID {id_depense}", id_user, id_depense))

    cursor.execute("DELETE FROM depense WHERE id_depense = %s", (id_depense,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Depense supprimee avec succes"}), 200