const API_BASE_URL = 'http://127.0.0.1:5050/api/committees';

export async function fetchCommittees(params = {}) {
  const query = new URLSearchParams();
  if (params.search && params.search.trim()) {
    query.append('search', params.search.trim());
  }
  if (params.status && params.status !== 'All') {
    query.append('status', params.status);
  }
  if (params.minContribution) {
    query.append('minContribution', params.minContribution);
  }
  if (params.maxContribution) {
    query.append('maxContribution', params.maxContribution);
  }

  const url = `${API_BASE_URL}${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch committees: ${response.statusText}`);
  }

  const result = await response.json();
  return {
    success: result.success,
    count: result.count ?? (result.data ? result.data.length : 0),
    data: Array.isArray(result.data) ? result.data : [],
  };
}

export async function fetchCommitteeById(id) {
  if (!id) throw new Error('Committee ID is required');

  const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch committee details: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || null;
}

export async function createCommittee(committeePayload) {
  const headers = { 'Content-Type': 'application/json' };
  if (committeePayload.organizerEmail) headers['x-user-email'] = committeePayload.organizerEmail;
  if (committeePayload.organizerId) headers['x-user-id'] = committeePayload.organizerId;

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(committeePayload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || `Failed to create committee: ${response.statusText}`);
  }

  return result.data;
}

export async function joinCommittee(committeeId, memberPayload) {
  if (!committeeId) throw new Error('Committee ID is required');

  const headers = { 'Content-Type': 'application/json' };
  if (memberPayload.email) headers['x-user-email'] = memberPayload.email;
  if (memberPayload.memberId) headers['x-user-id'] = memberPayload.memberId;

  const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(committeeId)}/join`, {
    method: 'POST',
    headers,
    body: JSON.stringify(memberPayload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || `Failed to join committee: ${response.statusText}`);
  }

  return result.data;
}

export const committeeService = {
  fetchCommittees,
  fetchCommitteeById,
  createCommittee,
  joinCommittee,
};

export default committeeService;
