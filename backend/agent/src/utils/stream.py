"""
Stream utilities for parsing LangGraph events from Agora agents.

Provides the AgentEventParser class for extracting metadata from
streaming events across all agent types.
"""

from typing import Any


class AgentEventParser:
    """
    Unified event parser for all Agora agents.

    Extracts metadata from LangGraph streaming events, providing
    a consistent interface for processing agent output streams.

    Usage:
        parser = AgentEventParser("matchmaker")
        async for event in agent.match_stream(journey, thread_id):
            metadata = parser.parse(event)
            if metadata["thinking_messages"]:
                print(metadata["thinking_messages"][-1])
    """

    AGENT_TYPES = [
        "catalogue_ingestor",
        "personal_stylist",
        "matchmaker",
        "fitting_assistant",
        "style_dna"
    ]

    def __init__(self, agent_type: str):
        """
        Initialize parser for a specific agent type.

        Args:
            agent_type: One of AGENT_TYPES (e.g., "matchmaker", "style_dna")

        Raises:
            ValueError: If agent_type is not recognized
        """
        if agent_type not in self.AGENT_TYPES:
            raise ValueError(
                f"Unknown agent_type '{agent_type}'. "
                f"Must be one of: {', '.join(self.AGENT_TYPES)}"
            )
        self.agent_type = agent_type

        # Map agent types to their parse methods
        self._parsers = {
            "catalogue_ingestor": self._parse_catalogue_ingestor,
            "personal_stylist": self._parse_personal_stylist,
            "matchmaker": self._parse_matchmaker,
            "fitting_assistant": self._parse_fitting_assistant,
            "style_dna": self._parse_style_dna,
        }

    def parse(self, event: dict) -> dict:
        """
        Parse a LangGraph event and return agent-specific metadata.

        Args:
            event: Raw event dict from LangGraph astream_events()

        Returns:
            Dict containing extracted metadata. Always includes:
            - thinking_messages: list[str] - AI thinking/reasoning content
            - Additional fields vary by agent type
        """
        return self._parsers[self.agent_type](event)

    def _extract_thinking_messages(self, data: dict) -> list[str]:
        """
        Extract thinking messages from event data.

        Thinking messages are found in model response content
        when using models with thinking/reasoning capabilities.

        Args:
            data: The 'data' field from a LangGraph event

        Returns:
            List of thinking message strings (may be empty)
        """
        thinking_messages = []

        # Thinking can be in 'chunk' (streaming) or 'output' (complete)
        msg_source = data.get('chunk') or data.get('output')

        if msg_source and hasattr(msg_source, 'content'):
            content = msg_source.content
            if isinstance(content, list):
                for part in content:
                    if isinstance(part, dict) and part.get('type') == 'thinking':
                        thinking_text = part.get('thinking')
                        if thinking_text:
                            thinking_messages.append(thinking_text)

        return thinking_messages

    def _extract_state(self, data: dict) -> dict | None:
        """
        Extract agent state from event data.

        State can appear in different locations depending on event type:
        - 'chunk': During on_chain_stream events
        - 'output': During on_chain_end events
        - 'input': During on_chain_start events

        Args:
            data: The 'data' field from a LangGraph event

        Returns:
            State dict if found, None otherwise
        """
        for key in ['chunk', 'output', 'input']:
            if isinstance(data.get(key), dict):
                return data.get(key)
        return None

    def _parse_catalogue_ingestor(self, event: dict) -> dict:
        """
        Parse events from CatalogueIngestor agent.

        Returns:
            Dict with keys:
            - thinking_messages: list[str]
            - current_page: int | None - Current page being processed
            - item_count: int | None - Number of items extracted so far
        """
        data = event.get('data', {})
        state = self._extract_state(data)

        result = {
            "thinking_messages": self._extract_thinking_messages(data),
            "current_page": None,
            "item_count": None,
        }

        if state:
            # Page index from state
            if 'current_page_idx' in state:
                result["current_page"] = state.get('current_page_idx')

            # Count of extracted items
            items = state.get('catalogue_items', [])
            if isinstance(items, list):
                result["item_count"] = len(items)

        return result

    def _parse_personal_stylist(self, event: dict) -> dict:
        """
        Parse events from PersonalStylistAgent.

        Returns:
            Dict with keys:
            - thinking_messages: list[str]
            - ui_components: list - UI input components for user
            - user_responses: list - User's answers to UI components
            - journey: dict | None - Current JourneySchema state
        """
        data = event.get('data', {})
        state = self._extract_state(data)

        result = {
            "thinking_messages": self._extract_thinking_messages(data),
            "ui_components": [],
            "user_responses": [],
            "journey": None,
        }

        if state:
            # UI input components
            ui_inputs = state.get('ui_inputs', [])
            if isinstance(ui_inputs, list):
                result["ui_components"] = ui_inputs

            # User responses
            ui_answers = state.get('ui_answers', [])
            if isinstance(ui_answers, list):
                result["user_responses"] = ui_answers

            # Journey schema
            journey = state.get('journey')
            if journey:
                result["journey"] = journey

        return result

    def _parse_matchmaker(self, event: dict) -> dict:
        """
        Parse events from MatchMakerAgent.

        Returns:
            Dict with keys:
            - thinking_messages: list[str]
            - matches: list - Product matches found
            - iteration_count: int | None - Current iteration number
        """
        data = event.get('data', {})
        state = self._extract_state(data)

        result = {
            "thinking_messages": self._extract_thinking_messages(data),
            "matches": [],
            "iteration_count": None,
        }

        if state:
            # Product matches
            matches = state.get('matches')
            if matches:
                # matches could be a MatchResult object or dict
                if hasattr(matches, 'matches'):
                    result["matches"] = matches.matches
                elif isinstance(matches, dict) and 'matches' in matches:
                    result["matches"] = matches['matches']
                elif isinstance(matches, list):
                    result["matches"] = matches

            # Iteration count
            if 'iteration_count' in state:
                result["iteration_count"] = state.get('iteration_count')

        return result

    def _parse_fitting_assistant(self, event: dict) -> dict:
        """
        Parse events from FittingAssistantAgent.

        Returns:
            Dict with keys:
            - thinking_messages: list[str]
            - fitting_sets: list - Generated fitting room images
            - product_details: list - Details of products being fitted
            - message: str | None - Assistant's response message
        """
        data = event.get('data', {})
        state = self._extract_state(data)

        result = {
            "thinking_messages": self._extract_thinking_messages(data),
            "fitting_sets": [],
            "product_details": [],
            "message": None,
        }

        if state:
            # Fitting sets (generated images)
            fitting_sets = state.get('fitting_sets')
            if fitting_sets:
                if hasattr(fitting_sets, 'fitting_sets'):
                    result["fitting_sets"] = fitting_sets.fitting_sets
                elif isinstance(fitting_sets, dict) and 'fitting_sets' in fitting_sets:
                    result["fitting_sets"] = fitting_sets['fitting_sets']
                elif isinstance(fitting_sets, list):
                    result["fitting_sets"] = fitting_sets

                # Extract message from FittingSets
                if hasattr(fitting_sets, 'message'):
                    result["message"] = fitting_sets.message
                elif isinstance(fitting_sets, dict):
                    result["message"] = fitting_sets.get('message')

            # Product details
            product_details = state.get('product_details', [])
            if isinstance(product_details, list):
                result["product_details"] = product_details

        return result

    def _parse_style_dna(self, event: dict) -> dict:
        """
        Parse events from StyleDnaAgent.

        Returns:
            Dict with keys:
            - thinking_messages: list[str]
            - updated_style_dna: dict | None - New/updated StyleDna
            - current_style_dna: dict | None - Previous StyleDna from memory
            - celebrity_twin_images: list[str] - Celebrity reference images
        """
        data = event.get('data', {})
        state = self._extract_state(data)

        result = {
            "thinking_messages": self._extract_thinking_messages(data),
            "updated_style_dna": None,
            "current_style_dna": None,
            "celebrity_twin_images": [],
        }

        if state:
            # Updated style DNA
            updated_dna = state.get('updated_style_dna')
            if updated_dna:
                if hasattr(updated_dna, 'model_dump'):
                    result["updated_style_dna"] = updated_dna.model_dump()
                elif isinstance(updated_dna, dict):
                    result["updated_style_dna"] = updated_dna

            # Current style DNA (from memory)
            current_dna = state.get('current_style_dna')
            if current_dna:
                if hasattr(current_dna, 'model_dump'):
                    result["current_style_dna"] = current_dna.model_dump()
                elif isinstance(current_dna, dict):
                    result["current_style_dna"] = current_dna

            # Celebrity twin images
            if result["updated_style_dna"]:
                images = result["updated_style_dna"].get('celebrity_twin_images', [])
                if isinstance(images, list):
                    result["celebrity_twin_images"] = images

        return result
