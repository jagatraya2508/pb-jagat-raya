
const createCategory = async () => {
    try {
        const response = await fetch('http://localhost:5001/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'TEST CAT ' + Date.now(),
                description: 'Description',
                match_type: 'single'
            })
        });
        const data = await response.json();
        console.log('Create Response:', response.status, data);

        if (response.ok && data.id) {
            // Clean up
            await fetch(`http://localhost:5001/api/categories/${data.id}`, { method: 'DELETE' });
            console.log('Cleaned up category');
        }

    } catch (err) {
        console.error('Error:', err);
    }
};

createCategory();
