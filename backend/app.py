from flask import Flask, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_connection
from chatbot import get_chatbot_response

app = Flask(__name__)


# ---------------- CORS CONFIGURATION ----------------

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:5174"
    ]

    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, PUT, DELETE, OPTIONS"
        )
        response.headers["Vary"] = "Origin"

    return response


# ---------------- HOME AND HEALTH ----------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "AI-Assisted Smart Pet Care & Veterinary Management Platform API"
    }), 200


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "Backend is running"}), 200


# ---------------- USER REGISTRATION ----------------

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data is required"}), 400

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "pet_owner")

    if not full_name or not email or not password:
        return jsonify({
            "error": "Full name, email and password are required"
        }), 400

    if role not in ["pet_owner", "veterinarian", "admin"]:
        return jsonify({"error": "Invalid role"}), 400

    password_hash = generate_password_hash(password)

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO users (full_name, email, password_hash, role)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                    """,
                    (full_name, email, password_hash, role)
                )
                user_id = cursor.fetchone()[0]

        return jsonify({
            "message": "User registered successfully!",
            "user_id": user_id
        }), 201

    except Exception:
        return jsonify({
            "error": "Registration failed. The email may already be registered."
        }), 400


# ---------------- USER LOGIN ----------------

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data is required"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, full_name, email, password_hash, role
                    FROM users
                    WHERE email = %s;
                    """,
                    (email,)
                )
                user = cursor.fetchone()

        if user and check_password_hash(user[3], password):
            return jsonify({
                "message": "Login successful!",
                "user_id": user[0],
                "full_name": user[1],
                "email": user[2],
                "role": user[4]
            }), 200

        return jsonify({"error": "Invalid email or password"}), 401

    except Exception as error:
        print("LOGIN ERROR:", repr(error))
        return jsonify({"error": "Login failed"}), 500


# ---------------- ADD PET ----------------

@app.route("/api/pets", methods=["POST"])
def add_pet():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data is required"}), 400

    owner_id = data.get("owner_id")
    pet_name = data.get("pet_name")
    species = data.get("species")
    breed = data.get("breed")
    date_of_birth = data.get("date_of_birth")
    gender = data.get("gender")

    if not owner_id or not pet_name or not species:
        return jsonify({
            "error": "Owner ID, pet name and species are required"
        }), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO pets
                    (owner_id, pet_name, species, breed, date_of_birth, gender)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id;
                    """,
                    (
                        owner_id,
                        pet_name,
                        species,
                        breed,
                        date_of_birth,
                        gender
                    )
                )

                pet_id = cursor.fetchone()[0]

        return jsonify({
            "message": "Pet added successfully!",
            "pet_id": pet_id
        }), 201

    except Exception as error:
        print("ADD PET ERROR:", repr(error))
        return jsonify({
            "error": "Unable to add pet",
            "details": str(error)
        }), 400
# ---------------- VIEW PETS ----------------

@app.route("/api/pets/<int:owner_id>", methods=["GET"])
def view_pets(owner_id):
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, pet_name, species, breed,
                           date_of_birth, gender, created_at
                    FROM pets
                    WHERE owner_id = %s
                    ORDER BY id;
                    """,
                    (owner_id,)
                )
                rows = cursor.fetchall()

        pets = []

        for row in rows:
            pets.append({
                "pet_id": row[0],
                "pet_name": row[1],
                "species": row[2],
                "breed": row[3],
                "date_of_birth": (
                    row[4].isoformat() if row[4] else None
                ),
                "gender": row[5],
                "created_at": (
                    row[6].isoformat() if row[6] else None
                )
            })

        return jsonify({
            "owner_id": owner_id,
            "pets": pets
        }), 200

    except Exception as error:
        print("VIEW PETS ERROR:", repr(error))
        return jsonify({
            "error": "Unable to retrieve pets",
            "details": str(error)
        }), 500
    

# ---------------- UPDATE PET ----------------

@app.route("/api/pets/<int:pet_id>", methods=["PUT"])
def update_pet(pet_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data is required"}), 400

    pet_name = data.get("pet_name")
    species = data.get("species")
    breed = data.get("breed")
    date_of_birth = data.get("date_of_birth")
    gender = data.get("gender")

    if not pet_name or not species:
        return jsonify({
            "error": "Pet name and species are required"
        }), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE pets
                    SET pet_name = %s,
                        species = %s,
                        breed = %s,
                        date_of_birth = %s,
                        gender = %s
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (
                        pet_name,
                        species,
                        breed,
                        date_of_birth,
                        gender,
                        pet_id
                    )
                )

                updated = cursor.fetchone()

        if not updated:
            return jsonify({"error": "Pet not found"}), 404

        return jsonify({
            "message": "Pet updated successfully!",
            "pet_id": pet_id
        }), 200

    except Exception as error:
        print("UPDATE PET ERROR:", repr(error))
        return jsonify({
            "error": "Unable to update pet",
            "details": str(error)
        }), 400

# ---------------- DELETE PET ----------------

@app.route("/api/pets/<int:pet_id>", methods=["DELETE"])
def delete_pet(pet_id):
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    DELETE FROM pets
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (pet_id,)
                )

                deleted = cursor.fetchone()

        if not deleted:
            return jsonify({"error": "Pet not found"}), 404

        return jsonify({
            "message": "Pet deleted successfully!",
            "pet_id": pet_id
        }), 200

    except Exception as error:
        print("DELETE PET ERROR:", repr(error))
        return jsonify({
            "error": "Unable to delete pet",
            "details": str(error)
        }), 400

# ---------------- BOOK APPOINTMENT ----------------

@app.route("/api/appointments", methods=["POST"])
def book_appointment():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data is required"}), 400

    pet_id = data.get("pet_id")
    vet_id = data.get("vet_id")
    appointment_datetime = data.get("appointment_datetime")
    reason = data.get("reason")

    if not pet_id or not appointment_datetime:
        return jsonify({
            "error": "Pet ID and appointment date/time are required"
        }), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO appointments
                    (pet_id, vet_id, appointment_datetime, reason)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                    """,
                    (pet_id, vet_id, appointment_datetime, reason)
                )
                appointment_id = cursor.fetchone()[0]

        return jsonify({
            "message": "Appointment booked successfully!",
            "appointment_id": appointment_id
        }), 201

    except Exception:
        return jsonify({
            "error": "Unable to book appointment. Please check the pet and veterinarian IDs."
        }), 400


# ---------------- VIEW APPOINTMENTS ----------------

@app.route("/api/appointments/<int:pet_id>", methods=["GET"])
def view_appointments(pet_id):
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, pet_id, vet_id,
                           appointment_datetime, reason
                    FROM appointments
                    WHERE pet_id = %s
                    ORDER BY appointment_datetime;
                    """,
                    (pet_id,)
                )
                rows = cursor.fetchall()

        appointments = []

        for row in rows:
            appointments.append({
                "appointment_id": row[0],
                "pet_id": row[1],
                "vet_id": row[2],
                "appointment_datetime": (
                    row[3].isoformat() if row[3] else None
                ),
                "reason": row[4]
            })

        return jsonify({
            "pet_id": pet_id,
            "appointments": appointments
        }), 200

    except Exception:
        return jsonify({"error": "Unable to retrieve appointments"}), 500


# ---------------- UPDATE APPOINTMENT ----------------

@app.route("/api/appointments/<int:appointment_id>", methods=["PUT"])
def update_appointment(appointment_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data is required"}), 400

    appointment_datetime = data.get("appointment_datetime")
    reason = data.get("reason")

    if not appointment_datetime or not reason:
        return jsonify({
            "error": "Appointment date/time and reason are required"
        }), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE appointments
                    SET appointment_datetime = %s,
                        reason = %s
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (appointment_datetime, reason, appointment_id)
                )
                updated = cursor.fetchone()

        if not updated:
            return jsonify({"error": "Appointment not found"}), 404

        return jsonify({
            "message": "Appointment updated successfully!",
            "appointment_id": appointment_id
        }), 200

    except Exception:
        return jsonify({"error": "Unable to update appointment"}), 400


# ---------------- DELETE APPOINTMENT ----------------

@app.route("/api/appointments/<int:appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    DELETE FROM appointments
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (appointment_id,)
                )
                deleted = cursor.fetchone()

        if not deleted:
            return jsonify({"error": "Appointment not found"}), 404

        return jsonify({
            "message": "Appointment deleted successfully!",
            "appointment_id": appointment_id
        }), 200

    except Exception:
        return jsonify({"error": "Unable to delete appointment"}), 400

    # ---------------- ADD VACCINATION ----------------

@app.route("/api/vaccinations", methods=["POST"])
def add_vaccination():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data is required"}), 400

    pet_id = data.get("pet_id")
    vaccine_name = data.get("vaccine_name")
    date_given = data.get("date_given")
    next_due_date = data.get("next_due_date")
    notes = data.get("notes")

    if not pet_id or not vaccine_name or not date_given:
        return jsonify({
            "error": "Pet ID, vaccine name and date given are required"
        }), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO vaccinations
                    (pet_id, vaccine_name, date_given, next_due_date, notes)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id;
                    """,
                    (pet_id, vaccine_name, date_given,
                     next_due_date, notes)
                )

                vaccination_id = cursor.fetchone()[0]

        return jsonify({
            "message": "Vaccination record added successfully!",
            "vaccination_id": vaccination_id
        }), 201

    except Exception:
        return jsonify({
            "error": "Unable to add vaccination record. Check the pet ID and date values."
        }), 400


# ---------------- VIEW VACCINATIONS ----------------

@app.route("/api/vaccinations/<int:pet_id>", methods=["GET"])
def view_vaccinations(pet_id):
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, pet_id, vaccine_name,
                           date_given, next_due_date, notes, created_at
                    FROM vaccinations
                    WHERE pet_id = %s
                    ORDER BY date_given DESC;
                    """,
                    (pet_id,)
                )

                rows = cursor.fetchall()

        vaccinations = []

        for row in rows:
            vaccinations.append({
                "vaccination_id": row[0],
                "pet_id": row[1],
                "vaccine_name": row[2],
                "date_given": row[3].isoformat() if row[3] else None,
                "next_due_date": row[4].isoformat() if row[4] else None,
                "notes": row[5],
                "created_at": row[6].isoformat() if row[6] else None
            })

        return jsonify({
            "pet_id": pet_id,
            "vaccinations": vaccinations
        }), 200

    except Exception:
        return jsonify({
            "error": "Unable to retrieve vaccination records"
        }), 500


# ---------------- UPDATE VACCINATION ----------------

@app.route("/api/vaccinations/<int:vaccination_id>", methods=["PUT"])
def update_vaccination(vaccination_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data is required"}), 400

    vaccine_name = data.get("vaccine_name")
    date_given = data.get("date_given")
    next_due_date = data.get("next_due_date")
    notes = data.get("notes")

    if not vaccine_name or not date_given:
        return jsonify({
            "error": "Vaccine name and date given are required"
        }), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE vaccinations
                    SET vaccine_name = %s,
                        date_given = %s,
                        next_due_date = %s,
                        notes = %s
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (
                        vaccine_name,
                        date_given,
                        next_due_date,
                        notes,
                        vaccination_id
                    )
                )

                updated = cursor.fetchone()

        if not updated:
            return jsonify({"error": "Vaccination record not found"}), 404

        return jsonify({
            "message": "Vaccination record updated successfully!",
            "vaccination_id": vaccination_id
        }), 200

    except Exception:
        return jsonify({
            "error": "Unable to update vaccination record"
        }), 400


# ---------------- DELETE VACCINATION ----------------

@app.route("/api/vaccinations/<int:vaccination_id>", methods=["DELETE"])
def delete_vaccination(vaccination_id):
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    DELETE FROM vaccinations
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (vaccination_id,)
                )

                deleted = cursor.fetchone()

        if not deleted:
            return jsonify({
                "error": "Vaccination record not found"
            }), 404

        return jsonify({
            "message": "Vaccination record deleted successfully!",
            "vaccination_id": vaccination_id
        }), 200

    except Exception:
        return jsonify({
            "error": "Unable to delete vaccination record"
        }), 400

    # ---------------- ADD MEDICAL RECORD ----------------

@app.route("/api/medical-records", methods=["POST"])
def add_medical_record():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data is required"}), 400

    pet_id = data.get("pet_id")
    vet_id = data.get("vet_id")
    diagnosis = data.get("diagnosis")
    treatment = data.get("treatment")
    notes = data.get("notes")
    record_date = data.get("record_date")

    if not pet_id or not diagnosis or not record_date:
        return jsonify({
            "error": "Pet ID, diagnosis and record date are required"
        }), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO medical_records
                    (pet_id, vet_id, diagnosis, treatment, notes, record_date)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id;
                    """,
                    (
                        pet_id,
                        vet_id,
                        diagnosis,
                        treatment,
                        notes,
                        record_date
                    )
                )

                record_id = cursor.fetchone()[0]

        return jsonify({
            "message": "Medical record added successfully!",
            "record_id": record_id
        }), 201

    except Exception:
        return jsonify({
            "error": "Unable to add medical record. Check the pet ID, veterinarian ID and date."
        }), 400


# ---------------- VIEW MEDICAL RECORDS ----------------

@app.route("/api/medical-records/<int:pet_id>", methods=["GET"])
def view_medical_records(pet_id):
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, pet_id, vet_id, diagnosis,
                           treatment, notes, record_date, created_at
                    FROM medical_records
                    WHERE pet_id = %s
                    ORDER BY record_date DESC;
                    """,
                    (pet_id,)
                )

                rows = cursor.fetchall()

        records = []

        for row in rows:
            records.append({
                "record_id": row[0],
                "pet_id": row[1],
                "vet_id": row[2],
                "diagnosis": row[3],
                "treatment": row[4],
                "notes": row[5],
                "record_date": (
                    row[6].isoformat() if row[6] else None
                ),
                "created_at": (
                    row[7].isoformat() if row[7] else None
                )
            })

        return jsonify({
            "pet_id": pet_id,
            "medical_records": records
        }), 200

    except Exception:
        return jsonify({
            "error": "Unable to retrieve medical records"
        }), 500


# ---------------- UPDATE MEDICAL RECORD ----------------

@app.route("/api/medical-records/<int:record_id>", methods=["PUT"])
def update_medical_record(record_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data is required"}), 400

    diagnosis = data.get("diagnosis")
    treatment = data.get("treatment")
    notes = data.get("notes")
    record_date = data.get("record_date")

    if not record_date:
        return jsonify({
            "error": "Record date is required"
        }), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE medical_records
                    SET diagnosis = %s,
                        treatment = %s,
                        notes = %s,
                        record_date = %s
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (
                        diagnosis,
                        treatment,
                        notes,
                        record_date,
                        record_id
                    )
                )

                updated = cursor.fetchone()

        if not updated:
            return jsonify({
                "error": "Medical record not found"
            }), 404

        return jsonify({
            "message": "Medical record updated successfully!",
            "record_id": record_id
        }), 200

    except Exception:
        return jsonify({
            "error": "Unable to update medical record"
        }), 400


# ---------------- DELETE MEDICAL RECORD ----------------

@app.route("/api/medical-records/<int:record_id>", methods=["DELETE"])
def delete_medical_record(record_id):
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    DELETE FROM medical_records
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (record_id,)
                )

                deleted = cursor.fetchone()

        if not deleted:
            return jsonify({
                "error": "Medical record not found"
            }), 404

        return jsonify({
            "message": "Medical record deleted successfully!",
            "record_id": record_id
        }), 200

    except Exception:
        return jsonify({
            "error": "Unable to delete medical record"
        }), 400


# ---------------- AI PET CARE CHATBOT ----------------

@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()

    if not data or "message" not in data:
        return jsonify({"error": "Please provide a message"}), 400

    user_message = data["message"].strip()

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    response = get_chatbot_response(user_message)

    return jsonify({
        "user_message": user_message,
        "bot_response": response
    }), 200


# ---------------- RUN FLASK SERVER ----------------

if __name__ == "__main__":
    app.run(debug=True)


# ---------------- ADMIN: VIEW ALL USERS ----------------

@app.route("/api/admin/users", methods=["GET"])
def admin_view_users():
    return jsonify({
        "error": "Admin authentication is not configured yet. This endpoint is disabled."
    }), 403
