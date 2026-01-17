
const editCategory = async () => {
    try {
        // 1. Create a dummy category
        const createRes = await fetch('http://localhost:5001/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'TEMP_EDIT_' + Date.now(),
                description: 'To be edited',
                match_type: 'single'
            })
        });
        const createdCat = await createRes.json();

        if (!createRes.ok) {
            console.error('Failed to create setup category:', createdCat);
            return;
        }

        console.log('Created category for editing:', createdCat.id);

        // 2. Edit it
        const response = await fetch(`http://localhost:5001/api/categories/${createdCat.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: createdCat.name + '_UPDATED',
                description: 'Updated Description',
                match_type: 'double'
            })
        });
        console.log('Update Status:', response.status);
        const text = await response.text();
        console.log('Update Response Body:', text);

        // Try parsing JSON only if it looks like JSON
        try {
            const data = JSON.parse(text);
            console.log('Update Data:', data);
        } catch (e) {
            console.log('Not JSON response');
        }

        // 3. Clean up
        await fetch(`http://localhost:5001/api/categories/${createdCat.id}`, { method: 'DELETE' });

    } catch (err) {
        console.error('Error:', err);
    }
};

editCategory();
