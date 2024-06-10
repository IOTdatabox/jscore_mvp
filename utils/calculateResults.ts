// utils/calculateResults.ts

export async function calculateAndStoreResults(answer: any) {
    // Perform your calculations here
    const calculatedResults = performCalculations(answer);

    // Generate a unique identifier for these results
    const resultId = generateUniqueIdentifier();

    // Store results in DB
    await storeResultsInDatabase(resultId, calculatedResults);

    return resultId;
}

function performCalculations(answer: any){
    console.log(answer[5].length);
    return answer[5].length;
}
