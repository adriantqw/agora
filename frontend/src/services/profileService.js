import consumerAuthService from './consumerAuthService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const profileService = {
  async updateProfile(profileData) {
    const token = consumerAuthService.getToken();

    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
  },

  async uploadAvatar(file) {
    const token = consumerAuthService.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/profile/avatar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) throw new Error('Failed to upload avatar');
    return await response.json();
  },

  async uploadFittingPhoto(file, angle) {
    const token = consumerAuthService.getToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('angle', angle);

    const response = await fetch(`${API_BASE_URL}/api/profile/fitting-room`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) throw new Error('Failed to upload photo');
    return await response.json();
  },

  async getFittingPhotos() {
    const token = consumerAuthService.getToken();

    const response = await fetch(`${API_BASE_URL}/api/profile/fitting-room`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch photos');
    return await response.json();
  },

  async deleteFittingPhoto(photoId) {
    const token = consumerAuthService.getToken();

    const response = await fetch(`${API_BASE_URL}/api/profile/fitting-room/${photoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to delete photo');
  }
};

export default profileService;
