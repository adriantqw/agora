"""
Quick test script for Style Profile API endpoints
Run this after starting the backend server to verify all endpoints work correctly.

Usage:
    python test_style_profile_api.py <consumer_jwt_token>
"""

import sys
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api"

def test_style_profile_api(token):
    """Test all style profile endpoints"""
    headers = {"Authorization": f"Bearer {token}"}

    print("\n" + "="*60)
    print("STYLE PROFILE API TEST")
    print("="*60)

    # Test 1: GET (should return 404 if no profile)
    print("\n1. Testing GET /api/style-profile (initial)")
    print("-" * 60)
    response = requests.get(f"{BASE_URL}/style-profile", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 404:
        print("✅ No profile exists yet (expected)")
    elif response.status_code == 200:
        print("✅ Profile exists:")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"❌ Unexpected status: {response.text}")
        return

    # Test 2: POST (create profile)
    print("\n2. Testing POST /api/style-profile (create)")
    print("-" * 60)
    create_data = {
        "vibes": ["Minimalist", "Classic Chic"],
        "loved_colors": ["#000000", "#F5F5F4", "#2563EB"],
        "avoided_colors": ["#FACC15"],
        "favorite_brands": ["Zara", "Aritzia"],
        "fit_preference": "Regular",
        "budget_tier": 2
    }
    response = requests.post(
        f"{BASE_URL}/style-profile",
        headers=headers,
        json=create_data
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        profile = response.json()
        print("✅ Profile created successfully:")
        print(f"   ID: {profile['id']}")
        print(f"   Vibes: {profile['vibes']}")
        print(f"   Profile Strength: {profile['profile_strength']}%")
        profile_id = profile['id']
    elif response.status_code == 409:
        print("✅ Profile already exists (expected if running test multiple times)")
        print("   Skipping to UPDATE test...")
    else:
        print(f"❌ Failed to create: {response.text}")
        return

    # Test 3: GET (retrieve created profile)
    print("\n3. Testing GET /api/style-profile (after create)")
    print("-" * 60)
    response = requests.get(f"{BASE_URL}/style-profile", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        profile = response.json()
        print("✅ Profile retrieved:")
        print(f"   Vibes: {profile['vibes']}")
        print(f"   Loved Colors: {profile['loved_colors']}")
        print(f"   Avoided Colors: {profile['avoided_colors']}")
        print(f"   Brands: {profile['favorite_brands']}")
        print(f"   Fit: {profile['fit_preference']}")
        print(f"   Budget: {profile['budget_tier']}")
        print(f"   Strength: {profile['profile_strength']}%")
    else:
        print(f"❌ Failed to retrieve: {response.text}")
        return

    # Test 4: PUT (update profile)
    print("\n4. Testing PUT /api/style-profile (update)")
    print("-" * 60)
    update_data = {
        "vibes": ["Minimalist", "Classic Chic", "Bohemian"],
        "loved_colors": ["#000000", "#F5F5F4", "#2563EB", "#10B981"],
        "avoided_colors": ["#FACC15", "#9333EA"],
        "favorite_brands": ["Zara", "Aritzia", "COS", "Reformation"],
        "budget_tier": 3
    }
    response = requests.put(
        f"{BASE_URL}/style-profile",
        headers=headers,
        json=update_data
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        profile = response.json()
        print("✅ Profile updated:")
        print(f"   Vibes: {profile['vibes']}")
        print(f"   New Strength: {profile['profile_strength']}%")
    else:
        print(f"❌ Failed to update: {response.text}")
        return

    # Test 5: Validation tests
    print("\n5. Testing Validation (invalid hex color)")
    print("-" * 60)
    invalid_data = {
        "loved_colors": ["#FFF"]  # Invalid - must be 7 chars
    }
    response = requests.put(
        f"{BASE_URL}/style-profile",
        headers=headers,
        json=invalid_data
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 422:
        print("✅ Validation correctly rejected invalid hex color")
    else:
        print(f"❌ Expected 422, got {response.status_code}")

    print("\n6. Testing Validation (invalid fit preference)")
    print("-" * 60)
    invalid_data = {
        "fit_preference": "Slim"  # Invalid - must be Tight/Regular/Oversized
    }
    response = requests.put(
        f"{BASE_URL}/style-profile",
        headers=headers,
        json=invalid_data
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 422:
        print("✅ Validation correctly rejected invalid fit preference")
    else:
        print(f"❌ Expected 422, got {response.status_code}")

    # Test 6: DELETE (optional - uncomment to test)
    # print("\n7. Testing DELETE /api/style-profile")
    # print("-" * 60)
    # response = requests.delete(f"{BASE_URL}/style-profile", headers=headers)
    # print(f"Status: {response.status_code}")
    # if response.status_code == 204:
    #     print("✅ Profile deleted successfully")
    # else:
    #     print(f"❌ Failed to delete: {response.text}")

    print("\n" + "="*60)
    print("ALL TESTS COMPLETED")
    print("="*60)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_style_profile_api.py <consumer_jwt_token>")
        print("\nTo get a token:")
        print("1. Start the backend: uvicorn app.main:app --reload")
        print("2. Go to http://localhost:8000/docs")
        print("3. Use POST /api/consumer-auth/login to get a token")
        print("4. Run this script with the token")
        sys.exit(1)

    token = sys.argv[1]
    test_style_profile_api(token)
