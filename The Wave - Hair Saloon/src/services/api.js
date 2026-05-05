const API_BASE = 'http://localhost:4000';

async function fetchJSON(path, opts = {}) {
  const res = await fetch(`${API_BASE}/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  list: (resource) => fetchJSON(resource),
  get: (resource, id) => fetchJSON(`${resource}/${id}`),
  create: (resource, body) => fetchJSON(resource, { method: 'POST', body: JSON.stringify(body) }),
  update: (resource, id, body) => fetchJSON(`${resource}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (resource, id) => fetchJSON(`${resource}/${id}`, { method: 'DELETE' }),
};
