
const verifyEdit = async () => {
    try {
        // 1. Create
        const createRes = await fetch('http://localhost:5001/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'FINAL_TEST_' + Date.now(),
                description: 'To be edited',
                match_type: 'single'
            })
        });
        const createdCat = await createRes.json();

        if (!createRes.ok) {
            console.error('Failed to create:', createdCat);
            return;
        }

        console.log('Created:', createdCat.id);

        // 2. Edit
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
        if (response.ok) {
            const data = await response.json();
            console.log('Update Success:', data);
        } else {
            const text = await response.text();
            console.log('Update Failed:', text);
        }

        // 3. Delete
        const deleteRes = await fetch(`http://localhost:5001/api/categories/${createdCat.id}`, { method: 'DELETE' });
        console.log('Delete Status:', deleteRes.status);

    } catch (err) {
        console.error('Error:', err);
    }
};

verifyEdit();
