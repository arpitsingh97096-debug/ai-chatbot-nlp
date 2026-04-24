import json
import random

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

# Load data
with open('intents.json') as file:
    data = json.load(file)

# Prepare training data
patterns = []
tags = []

for intent in data["intents"]:
    for pattern in intent["patterns"]:
        patterns.append(pattern)
        tags.append(intent["tag"])

# Convert text → numbers
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(patterns)

# Train model
model = MultinomialNB()
model.fit(X, tags)

# Chat loop
while True:
    user_input = input("You: ")

    X_test = vectorizer.transform([user_input])
    predicted_tag = model.predict(X_test)[0]

    for intent in data["intents"]:
        if intent["tag"] == predicted_tag:
            print("Bot:", random.choice(intent["responses"]))