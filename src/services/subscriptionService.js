const API_BASE_URL = 'http://127.0.0.1:5050/api/subscription';

export async function getMySubscription(userParams = {}) {
  const query = new URLSearchParams();
  if (userParams.email) query.append('email', userParams.email);
  if (userParams.userId) query.append('userId', userParams.userId);

  const headers = { 'Content-Type': 'application/json' };
  if (userParams.email) headers['x-user-email'] = userParams.email;
  if (userParams.userId) headers['x-user-id'] = userParams.userId;

  const url = `${API_BASE_URL}/me${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subscription status: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || null;
}

export async function activateDemoSubscription(userParams = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (userParams.organizerEmail) headers['x-user-email'] = userParams.organizerEmail;
  if (userParams.organizerId) headers['x-user-id'] = userParams.organizerId;

  const response = await fetch(`${API_BASE_URL}/demo-activate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(userParams),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || `Failed to activate demo subscription: ${response.statusText}`);
  }

  return result.data;
}

export async function resetDemoSubscription(userParams = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (userParams.organizerEmail) headers['x-user-email'] = userParams.organizerEmail;
  if (userParams.organizerId) headers['x-user-id'] = userParams.organizerId;

  const response = await fetch(`${API_BASE_URL}/demo-reset`, {
    method: 'POST',
    headers,
    body: JSON.stringify(userParams),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || `Failed to reset demo subscription: ${response.statusText}`);
  }

  return result.data;
}

export const subscriptionService = {
  getMySubscription,
  activateDemoSubscription,
  resetDemoSubscription,
};

export default subscriptionService;
