
const listTournaments = async () => {
    try {
        const response = await fetch('http://localhost:5001/api/tournaments');
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
};

listTournaments();
