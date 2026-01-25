from dotenv import load_dotenv

load_dotenv()

RECURSION_LIMIT = 200

class PersonalStylistAgent:
    """Personal Stylist Agent. This agent is responsible for generating a questionnaire based on the user's query."""
    def __init__(self):
        """Initialize the agent."""
        self.agent_config = load_config("agent")["personal_stylist"]
        self.model = load_model_from_config(self.agent_config["model"])
        self.templates = load_prompt_templates()["personal_stylist"]
        self.graph = self._compile_graph()