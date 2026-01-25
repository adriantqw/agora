"""Model utils module."""
from langchain_google_genai import ChatGoogleGenerativeAI

def load_model_from_config(config: dict):
    """Load the model from the config."""
    return ChatGoogleGenerativeAI(
        model = config["name"],
        **config["params"]
    )

def load_image_model_from_config(config: dict):
    """Load the image model from the config."""
    if "image_config" not in config or not config.get("image_config"):
        return ChatGoogleGenerativeAI(
            model = config["name"],
            **config["params"]
        )
    
    else:
        return ChatGoogleGenerativeAI(
            model = config["name"],
            image_config = config["image_config"],
            **config["params"]
        )