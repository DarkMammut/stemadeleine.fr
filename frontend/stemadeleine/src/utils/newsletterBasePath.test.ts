/**
 * Tests unitaires pour la normalisation du basePath des newsletters
 */

/**
 * Fonction de normalisation du basePath
 */
function normalizeBasePath(basePath: string): string {
    return basePath.replace(/\/+$/, '');
}

/**
 * Fonction de construction de l'URL de détail
 */
function buildDetailUrl(basePath: string, newsletterId: string | number): string {
    const normalized = normalizeBasePath(basePath);
    return `${normalized}/${newsletterId}`;
}

// Tests
console.log('=== Tests de normalisation du basePath ===\n');

const testCases = [
    {
        basePath: '/newsletters',
        newsletterId: '123',
        expected: '/newsletters/123',
        description: 'Chemin standard sans slash final'
    },
    {
        basePath: '/newsletters/',
        newsletterId: '123',
        expected: '/newsletters/123',
        description: 'Chemin avec slash final'
    },
    {
        basePath: '/newsletters///',
        newsletterId: '123',
        expected: '/newsletters/123',
        description: 'Chemin avec plusieurs slashs finaux'
    },
    {
        basePath: '/mon-espace/newsletters',
        newsletterId: '456',
        expected: '/mon-espace/newsletters/456',
        description: 'Chemin imbriqué sans slash final'
    },
    {
        basePath: '/mon-espace/newsletters/',
        newsletterId: '456',
        expected: '/mon-espace/newsletters/456',
        description: 'Chemin imbriqué avec slash final'
    },
    {
        basePath: '/paroisse/vie-paroissiale/bulletins',
        newsletterId: '789',
        expected: '/paroisse/vie-paroissiale/bulletins/789',
        description: 'Chemin profondément imbriqué'
    },
];

let allPassed = true;

testCases.forEach((testCase, index) => {
    const result = buildDetailUrl(testCase.basePath, testCase.newsletterId);
    const passed = result === testCase.expected;

    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`  Input:    basePath="${testCase.basePath}", newsletterId="${testCase.newsletterId}"`);
    console.log(`  Expected: "${testCase.expected}"`);
    console.log(`  Got:      "${result}"`);
    console.log(`  Status:   ${passed ? '✅ PASSED' : '❌ FAILED'}\n`);

    if (!passed) {
        allPassed = false;
    }
});

console.log(`\n=== Résultat final: ${allPassed ? '✅ Tous les tests ont réussi' : '❌ Certains tests ont échoué'} ===\n`);

export {normalizeBasePath, buildDetailUrl};

