
def get_chatbot_response(message):
    message = message.lower().strip()

    if any(word in message for word in ["hello", "hi", "hey"]):
        return "Hello! Welcome to Smart Pet Care. How can I help you and your pet today?"

    elif any(word in message for word in ["food", "diet", "nutrition", "eat"]):
        return "Provide your pet with a balanced diet suitable for its species, age and health. Avoid giving human foods unless your veterinarian confirms they are safe."

    elif any(word in message for word in ["grooming", "groom", "bath", "fur", "hair"]):
        return "Regular brushing, suitable bathing and nail care help keep pets clean and comfortable. Grooming needs vary by breed."

    elif any(word in message for word in ["vaccine", "vaccination", "vaccinated"]):
        return "Vaccinations help protect pets from serious diseases. Follow a vaccination schedule recommended by your veterinarian."

    elif any(word in message for word in ["exercise", "walk", "play"]):
        return "Regular exercise and play help pets stay healthy. Choose activities suitable for your pet's age, breed and fitness."

    elif any(word in message for word in ["water", "drink"]):
        return "Always provide your pet with clean, fresh drinking water."

    elif any(word in message for word in ["sick", "pain", "vomit", "injury", "emergency"]):
        return "I'm not a veterinarian and cannot diagnose illnesses. Please contact a veterinarian promptly. For severe symptoms or emergencies, seek immediate veterinary care."

    elif any(word in message for word in ["thank", "thanks"]):
        return "You're welcome! I'm happy to help you care for your pet."

    else:
        return "I'm here to help with general pet-care questions. You can ask me about food, grooming, vaccinations, exercise or hygiene. For medical concerns, please consult a veterinarian."
