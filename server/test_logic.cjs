
const players = [
    { id: 1, name: 'P1', ranking: 1 },
    { id: 2, name: 'P2', ranking: 2 },
    { id: 3, name: 'P3', ranking: 3 },
    { id: 4, name: 'P4', ranking: 4 },
    { id: 5, name: 'P5', ranking: 5 }
];

function test() {
    // Sort
    players.sort((a, b) => a.ranking - b.ranking);

    const bracketSize = Math.pow(2, Math.ceil(Math.log2(players.length)));
    const totalRounds = Math.log2(bracketSize);
    console.log({ bracketSize, totalRounds });

    let seedOrder = [1, 2];
    for (let i = 1; i < totalRounds; i++) {
        const nextOrder = [];
        const currentSize = Math.pow(2, i + 1);
        for (const val of seedOrder) {
            nextOrder.push(val);
            nextOrder.push(currentSize + 1 - val);
        }
        seedOrder = nextOrder;
    }
    console.log('SeedOrder:', seedOrder);

    let matchPairs = [];
    const firstRoundMatchesCount = bracketSize / 2;

    for (let i = 0; i < firstRoundMatchesCount; i++) {
        const seed1 = seedOrder[i * 2];
        const seed2 = seedOrder[i * 2 + 1];
        matchPairs.push({ seed1, seed2 });
    }
    console.log('Pairs Before:', matchPairs);

    if (matchPairs.length >= 2) {
        const mid = matchPairs.length / 2;
        const topHalf = matchPairs.slice(0, mid);
        const bottomHalf = matchPairs.slice(mid).reverse();
        matchPairs = [...topHalf, ...bottomHalf];
    }
    console.log('Pairs After:', matchPairs);
}

test();
