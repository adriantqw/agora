"""Utils module."""
import yaml
from pathlib import Path

# Get the agent directory (2 levels up from this file)
AGENT_DIR = Path(__file__).parent.parent.parent

def load_config(name: str):
    """
    Load the config file.

    Args:
        name: The name of the config file.

    Returns:
        The config file as a dictionary.
    """
    config_path = AGENT_DIR / f"config/{name}.yml"
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)
    return config

def load_prompt_templates():
    """
    Load the prompt templates.

    Returns:
        The prompt templates as a dictionary.
    """
    templates_path = AGENT_DIR / "src/prompts/templates.yml"
    with open(templates_path, "r") as f:
        templates = yaml.safe_load(f)
    return templates