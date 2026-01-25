from typing import Annotated, TypedDict
import operator

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from .schemas import *

class PersonalStylistState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    ui_inputs: Annotated[
        list[
            Union[
                ImageChoice,
                ColourPaletteOption,
                MultiSelectTextOption,
                ScaleRating,
                FreeTextResponse,
                TextWithImageResponse
            ]
        ], 
        operator.add
    ]
    ui_answers: Annotated[list[UserResponse]]