import TurndownService from "turndown";

export const formatQuestionContent = (htmlContent: string) => {
    const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        br: "  \n",
    });

    let markdownContent = turndownService.turndown(htmlContent);

    // Post-processing
    return markdownContent
        .replace(/\n/g, "\n\n")
        .replace(/\n\n(\*\*(?:Input|Output|Explanation|Example):?\*\*)/g, "\n\n\n$1")
        .replace(/\n{3,}/g, "\n\n");
};

export const formatTestResults = (results: any[]) => {
    // Overview section
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const overview = `Test Summary:\n` +
        `${passedTests}/${totalTests} tests passed\n` +
        `${'-'.repeat(20)}\n`;

    // Detailed results
    const details = results.map((result, index) => {
        const status = result.passed ? '✓ PASS' : '✗ FAIL';
        const statusClass = result.passed ? 'color: #22c55e' : 'color: #ef4444';

        return `Test Case ${result.caseNumber}: ${status}\n` +
            `Input: ${JSON.stringify(result.input)}\n` +
            `Expected: ${JSON.stringify(result.expected)}\n` +
            (result.error ? `Error: ${result.error}\n` :
                `Actual: ${JSON.stringify(result.actual)}\n`) +
            `${'-'.repeat(20)}\n`;
    }).join('\n');

    return `${overview}\n${details}`;
};

export const formatJSON = (obj: any): string => {
    return JSON.stringify(obj, null, 2);
}; 