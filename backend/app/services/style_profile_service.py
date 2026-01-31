from sqlalchemy.orm import Session
from app.models.style_profile import StyleProfile
from typing import Dict, Optional


def get_style_profile(db: Session, consumer_id: str) -> Optional[StyleProfile]:
    """Get consumer's style profile."""
    return db.query(StyleProfile).filter(StyleProfile.consumer_id == consumer_id).first()


def create_style_profile(db: Session, consumer_id: str, profile_data: Dict) -> StyleProfile:
    """Create a new style profile for consumer."""
    # Check if profile already exists
    existing = get_style_profile(db, consumer_id)
    if existing:
        raise ValueError("Style profile already exists for this consumer")

    profile = StyleProfile(
        consumer_id=consumer_id,
        vibes=profile_data.get('vibes', []),
        loved_colors=profile_data.get('loved_colors', []),
        avoided_colors=profile_data.get('avoided_colors', []),
        favorite_brands=profile_data.get('favorite_brands', []),
        fit_preference=profile_data.get('fit_preference'),
        budget_tier=profile_data.get('budget_tier', 2)
    )

    # Calculate archetype alignment strength
    profile.profile_strength = calculate_profile_strength(profile)

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def update_style_profile(db: Session, consumer_id: str, profile_data: Dict) -> StyleProfile:
    """Update existing style profile."""
    profile = get_style_profile(db, consumer_id)
    if not profile:
        raise ValueError("Style profile not found")

    # Update fields if provided
    if 'vibes' in profile_data:
        profile.vibes = profile_data['vibes']
    if 'loved_colors' in profile_data:
        profile.loved_colors = profile_data['loved_colors']
    if 'avoided_colors' in profile_data:
        profile.avoided_colors = profile_data['avoided_colors']
    if 'favorite_brands' in profile_data:
        profile.favorite_brands = profile_data['favorite_brands']
    if 'fit_preference' in profile_data:
        profile.fit_preference = profile_data['fit_preference']
    if 'budget_tier' in profile_data:
        profile.budget_tier = profile_data['budget_tier']

    # Recalculate archetype alignment strength
    profile.profile_strength = calculate_profile_strength(profile)

    db.commit()
    db.refresh(profile)
    return profile


def delete_style_profile(db: Session, consumer_id: str) -> bool:
    """Delete consumer's style profile."""
    profile = get_style_profile(db, consumer_id)
    if not profile:
        return False

    db.delete(profile)
    db.commit()
    return True


def calculate_profile_strength(profile: StyleProfile) -> int:
    """Calculate archetype alignment strength based on profile completion (0-100)."""
    total_fields = 6
    filled_fields = 0

    if profile.vibes and len(profile.vibes) > 0:
        filled_fields += 1
    if profile.loved_colors and len(profile.loved_colors) > 0:
        filled_fields += 1
    if profile.avoided_colors and len(profile.avoided_colors) > 0:
        filled_fields += 1
    if profile.favorite_brands and len(profile.favorite_brands) > 0:
        filled_fields += 1
    if profile.fit_preference:
        filled_fields += 1
    if profile.budget_tier and profile.budget_tier > 0:
        filled_fields += 1

    return int((filled_fields / total_fields) * 100)
