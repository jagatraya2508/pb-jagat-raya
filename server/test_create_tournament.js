
const createTournament = async () => {
    try {
        const response = await fetch('http://localhost:5001/api/tournaments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Tournament',
                start_date: '',
                end_date: '',
                registration_deadline: '',
                categories: 'Tunggal Putra',
                max_participants: 100,
                status: 'open'
            })
        });
        const data = await response.json();
        console.log('Response:', response.status, data);
    } catch (err) {
        console.error('Error:', err);
    }
};

createTournament();
