"""Utils module."""
import yaml

def load_config(name: str):
    """
    Load the config file.

    Args:
        name: The name of the config file.

    Returns:
        The config file as a dictionary.
    """
    with open(f"config/{name}.yml", "r") as f:
        config = yaml.safe_load(f)
    return config

def load_prompt_templates():
    """
    Load the prompt templates.

    Returns:
        The prompt templates as a dictionary.
    """
    with open("src/prompts/templates.yml", "r") as f:
        templates = yaml.safe_load(f)
    return templates