from langgraph.store.sqlite import SqliteStore
from langchain_core.tools import StructuredTool
import uuid

from .agents.schemas import StyleDna

class AgoraMemory:
    """
    Agora long-term memory util class
    """
    def __init__(self):
        """Initialise Agora long-term memory engine"""
        self.memory = self._initialise_memory_store()

    def _initialise_memory_store(self):
        """Initialise sqlite langgraph memory store"""
        with SqliteStore.from_conn_string(":memory:") as store:
            store.setup()

        return store
    
    def retrieve_memory(self, user_id: str):
        """
        Retrieve latest StyleDna for the user

        Args:
            user_id (str): User ID

        Returns:
            StyleDna: Latest StyleDna for the user
        """
        return self.memory.search(namespace=(user_id, "memories"))[-1].dict()
        
    def update_memory(self, user_id: str, updated_style_dna: StyleDna):
        """
        Update long-term memory store with updated StyleDna for the user

        Args:
            user_id (str): User ID
            updated_style_dna (StyleDna): New Style DNA to update memory store
        """
        return self.memory.put(
            namespace=(user_id, "memories"), 
            key=uuid.uuid4().hex, 
            value=updated_style_dna.model_dump_json()
        )
    
    def get_tools(self) -> list[StructuredTool]:
        """Get the memory util functions as tools for agent use."""
        return [
            StructuredTool.from_function(coroutine=self.update_memory),
            StructuredTool.from_function(coroutine=self.retrieve_memory)
        ]

