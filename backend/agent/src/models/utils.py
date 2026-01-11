"""Model utils module."""
from langchain_google_genai import ChatGoogleGenerativeAI

def load_model_from_config(config: dict):
    """Load the model from the config."""
    return ChatGoogleGenerativeAI(
        model = config["name"],
        **config["params"]
    )