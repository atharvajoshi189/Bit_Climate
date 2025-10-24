import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import json
import io
import os

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "plant_disease_model.pth")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.json")

# Load class names
with open(CLASS_NAMES_PATH, "r") as f:
    class_names = json.load(f)

# Load ResNet-50 model architecture
def load_model():
    model = models.resnet50(weights=None)   # weights=None because we will load our trained weights
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(class_names))  # final layer -> no. of classes

    # Load trained weights
    state_dict = torch.load(MODEL_PATH, map_location=torch.device("cpu"))
    model.load_state_dict(state_dict)
    model.eval()
    return model

model = load_model()

# Define image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Prediction function
def predict_disease(image_bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_tensor = transform(image).unsqueeze(0)  # add batch dimension

        with torch.no_grad():
            outputs = model(img_tensor)
            _, predicted = outputs.max(1)
            predicted_class = class_names[predicted.item()]

        return predicted_class
    except Exception as e:
        return f"Error during prediction: {str(e)}"
