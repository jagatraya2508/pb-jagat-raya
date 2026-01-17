
const editTournament = async () => {
    // 1. Get first tournament
    try {
        const listRes = await fetch('http://localhost:5001/api/tournaments');
        const tournaments = await listRes.json();
        if (tournaments.length === 0) {
            console.log('No tournaments found to edit.');
            return;
        }
        const t = tournaments[0];
        console.log('Editing tournament:', t.id);

        // 2. Update it with empty dates
        const response = await fetch(`http://localhost:5001/api/tournaments/${t.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: t.name + ' (Updated)',
                description: t.description,
                location: t.location,
                start_date: '', // Empty string
                end_date: '',   // Empty string
                registration_deadline: '', // Empty string
                categories: t.categories,
                max_participants: t.max_participants,
                status: t.status
            })
        });
        const data = await response.json();
        console.log('Update Response:', response.status, data);

    } catch (err) {
        console.error('Error:', err);
    }
};

editTournament();
