from pydantic import BaseModel, Field

class GoogleImageSearchQuery(BaseModel):
    query: str = Field(description="Google image search query")