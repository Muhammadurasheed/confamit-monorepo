
const safeParse = (data: any) => {
    if (!data) return null;

    if (typeof data === 'object') return data;
    if (typeof data !== 'string') return data;

    try {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'string') {
            try {
                return JSON.parse(parsed);
            } catch (e) {
                return parsed;
            }
        }
        return parsed;
    } catch (e) {
        if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
            try {
                const pythonToJSON = data
                    .replace(/'/g, '"')
                    .replace(/\bTrue\b/g, 'true')
                    .replace(/\bFalse\b/g, 'false')
                    .replace(/\bNone\b/g, 'null');
                return JSON.parse(pythonToJSON);
            } catch (e2) {
                console.warn('Failed to parse complex string data:', data.substring(0, 100) + '...');
                return data;
            }
        }
        return data;
    }
};

const testCases = [
    { name: 'Normal Array', input: [1, 2, 3], expected: [1, 2, 3] },
    { name: 'JSON String Array', input: '[1, 2, 3]', expected: [1, 2, 3] },
    { name: 'Double Encoded Array', input: '"[1, 2, 3]"', expected: [1, 2, 3] },
    { name: 'Python List String', input: "['a', 'b']", expected: ['a', 'b'] },
    { name: 'Plain String', input: 'Hello', expected: 'Hello' },
    { name: 'Null', input: null, expected: null },
];

console.log('Running safeParse verification...');
testCases.forEach(({ name, input, expected }) => {
    const result = safeParse(input);
    const success = JSON.stringify(result) === JSON.stringify(expected);
    console.log(`${success ? '✅' : '❌'} ${name}:`, success ? 'Passed' : `Failed (Got: ${JSON.stringify(result)})`);
});
