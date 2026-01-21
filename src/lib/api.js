const API_URL = 'http://localhost:5001/api';

export const api = {
    members: {
        list: async () => {
            const res = await fetch(`${API_URL}/members`);
            if (!res.ok) throw new Error('Failed to fetch members');
            return await res.json();
        },
        create: async (data) => {
            const res = await fetch(`${API_URL}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create member');
            return await res.json();
        },
        update: async (id, data) => {
            const res = await fetch(`${API_URL}/members/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update member');
            return await res.json();
        },
        delete: async (id) => {
            const res = await fetch(`${API_URL}/members/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete member');
            return await res.json();
        }
    },
    tournaments: {
        list: async (status = null) => {
            const url = status ? `${API_URL}/tournaments?status=${status}` : `${API_URL}/tournaments`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch tournaments');
            return await res.json();
        },
        create: async (data) => {
            const res = await fetch(`${API_URL}/tournaments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create tournament');
            return await res.json();
        },
        update: async (id, data) => {
            const res = await fetch(`${API_URL}/tournaments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update tournament');
            return await res.json();
        },
        delete: async (id) => {
            const res = await fetch(`${API_URL}/tournaments/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete tournament');
            return await res.json();
        }
    },
    registrations: {
        list: async () => {
            const res = await fetch(`${API_URL}/registrations`);
            if (!res.ok) throw new Error('Failed to fetch registrations');
            return await res.json();
        },
        listByTournament: async (tournamentId) => {
            const res = await fetch(`${API_URL}/tournaments/${tournamentId}/registrations`);
            if (!res.ok) throw new Error('Failed to fetch registrations');
            return await res.json();
        },
        create: async (data) => {
            const res = await fetch(`${API_URL}/registrations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to register');
            return await res.json();
        },
        update: async (id, data) => {
            const res = await fetch(`${API_URL}/registrations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update registration');
            return await res.json();
        },
        delete: async (id) => {
            const res = await fetch(`${API_URL}/registrations/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete registration');
            return await res.json();
        }
    },
    categories: {
        list: async () => {
            const res = await fetch(`${API_URL}/categories`);
            if (!res.ok) throw new Error('Failed to fetch categories');
            return await res.json();
        },
        create: async (data) => {
            const res = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create category');
            return await res.json();
        },
        update: async (id, data) => {
            const res = await fetch(`${API_URL}/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update category');
            return await res.json();
        },
        delete: async (id) => {
            const res = await fetch(`${API_URL}/categories/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete category');
            return await res.json();
        }
    },
    brackets: {
        listByTournament: async (tournamentId) => {
            const res = await fetch(`${API_URL}/brackets/${tournamentId}`);
            if (!res.ok) throw new Error('Failed to fetch brackets');
            return await res.json();
        },
        getByCategory: async (tournamentId, category) => {
            const res = await fetch(`${API_URL}/brackets/${tournamentId}/${encodeURIComponent(category)}`);
            if (!res.ok) throw new Error('Failed to fetch bracket');
            return await res.json();
        },
        generate: async (data) => {
            const res = await fetch(`${API_URL}/brackets/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to generate bracket');
            }
            return await res.json();
        },
        updateMatch: async (matchId, data) => {
            const res = await fetch(`${API_URL}/brackets/match/${matchId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update match');
            return await res.json();
        },
        updateLayout: async (updates) => {
            const res = await fetch(`${API_URL}/brackets/layout`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            });
            if (!res.ok) throw new Error('Failed to update layout');
            return await res.json();
        },
        delete: async (id) => {
            const res = await fetch(`${API_URL}/brackets/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete bracket');
            return await res.json();
        }
    },
    users: {
        list: async () => {
            const res = await fetch(`${API_URL}/users`);
            if (!res.ok) throw new Error('Failed to fetch users');
            return await res.json();
        },
        create: async (data) => {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create user');
            }
            return await res.json();
        },
        update: async (id, data) => {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update user');
            }
            return await res.json();
        },
        delete: async (id) => {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete user');
            return await res.json();
        }
    },
    content: {
        list: async () => {
            const res = await fetch(`${API_URL}/content`);
            if (!res.ok) throw new Error('Failed to fetch content');
            return await res.json();
        },
        get: async (key) => {
            const res = await fetch(`${API_URL}/content/${key}`);
            if (!res.ok) throw new Error('Failed to fetch content');
            return await res.json();
        },
        update: async (key, data) => {
            const res = await fetch(`${API_URL}/content/${key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update content');
            return await res.json();
        },
        uploadImage: async (file) => {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch(`${API_URL}/upload/gallery`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error('Failed to upload image');
            return await res.json();
        }
    }
};
