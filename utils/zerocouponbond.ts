export async function getInterestRate(simulationYears: number): Promise<number[] | Error> {
    try {
        const response = await fetch(`https://api.apify.com/v2/actor-tasks/G8G8r6kF2jeQku3vf/run-sync-get-dataset-items/`, {
            method: 'post',
            body: JSON.stringify({
                'interpolation_length': simulationYears,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer apify_api_IyxytYGIfOEpJfylFJkPxNaETpzRvF1eUqX0`,
            },
        });
        const jsonData = await response.json();
        if (Array.isArray(jsonData) && jsonData.length > 1 && "Interpolated Treasury Rates" in jsonData[1]) {
            return jsonData[1]["Interpolated Treasury Rates"];
        } else {
            console.error('Invalid JSON response structure');
            return [];
        }

    } catch (error) {
        // Type narrowing to ensure error is an instance of Error
        if (error instanceof Error) {
            console.log('Error calling Apify API: ' + error.toString());
            return error;
        } else {
            // Handle other types of errors if necessary
            console.log('Unknown error type');
            return new Error(String(error));
        }
    }
}