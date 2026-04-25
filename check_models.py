from google import genai

client = genai.Client(api_key="AIzaSyACS-EOe6Bzpcx-UxS-ZJ3EUnk1qZ9DTb8")

models = client.models.list()

for m in models:
    print(m.name)