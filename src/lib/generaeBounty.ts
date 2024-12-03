async function generateBounty(hint: string, category: string, difficulty: string) {
    const response = await fetch('/api/generateBounty', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hint, category, difficulty }),
    });

    const data = await response.json();
    return data.generatedBounty;
}

export default generateBounty;