import os
from typing import Annotated

from langchain_core.tools import tool, InjectedToolCallId
from langchain_core.messages import ToolMessage
from langgraph.types import Command
from langgraph.prebuilt import InjectedState

from ..schemas import JourneySchema
    
@tool
def update_mood_board(
    img_path: str, state: Annotated[dict, InjectedState], tool_call_id: Annotated[str, InjectedToolCallId]
):
    """
    Update Journey state with mood board that encapsulates user preferences.

    Args:
        img_path (str): File path to the mood board image
    """
    if os.path.exists(img_path):
        journey: JourneySchema = state.get('journey')
        if state.get('journey'):
            # Update journey with mood board
            updated_journey = journey.model_copy()
            updated_journey.mood_board_path = img_path

            return Command(update={
                "journey": updated_journey,
                "messages": [
                    ToolMessage(content=f"Successfully saved {img_path} to state", tool_call_id=tool_call_id)
                ]
            })
        else:
            return f"Could not find journey in state: {state}"
    else:
        return f"Could not find file path for {img_path}"