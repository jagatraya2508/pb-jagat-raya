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
    }
};
