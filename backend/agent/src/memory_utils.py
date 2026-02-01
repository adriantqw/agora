import os
from pathlib import Path

from langgraph.store.sqlite import SqliteStore
from langchain_core.tools import StructuredTool
import uuid

from .agents.schemas import StyleDna

# Default database path - can be overridden via environment variable
DEFAULT_DB_PATH = "agora_memory.db"


class AgoraMemory:
    """
    Agora long-term memory util class
    """
    def __init__(self):
        """Initialise Agora long-term memory engine."""
        self.db_path = DEFAULT_DB_PATH
        self.memory = self._initialise_memory_store()

    def _initialise_memory_store(self):
        """Initialise sqlite langgraph memory store.

        Note: We manually enter the context manager and store it so the
        connection remains open for the lifetime of the AgoraMemory instance.
        """
        self._store_context = SqliteStore.from_conn_string(self.db_path)
        store = self._store_context.__enter__()
        store.setup()
        return store

    def __del__(self):
        """Clean up the store connection when the AgoraMemory instance is destroyed."""
        if hasattr(self, '_store_context') and self._store_context:
            try:
                self._store_context.__exit__(None, None, None)
            except Exception:
                pass  # Ignore errors during cleanup
    
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
        self.memory.put(
            namespace=(user_id, "memories"), 
            key=uuid.uuid4().hex, 
            value=updated_style_dna.model_dump_json()
        )

        return True
    
    def clear_memory(self, user_id: str):
        """
        Clear long-term memory for the user

        Args:
            user_id (str): User ID
        """
        memories=self.memory.search((user_id, "memories"))
        for mem in memories:
            self.memory.delete((user_id, "memories"), mem.key)

        return True
    
    def get_tools(self) -> list[StructuredTool]:
        """Get the memory util functions as tools for agent use."""
        return [
            StructuredTool.from_function(coroutine=self.update_memory),
            StructuredTool.from_function(coroutine=self.retrieve_memory)
        ]

