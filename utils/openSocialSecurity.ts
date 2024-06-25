
/* personAGender 'male' or 'female' */
export async function getOSSForSeveralFiledDate(personAGender: string, personADobM: number, personADobD: number, personADobY: number, personAPIA: number) { // if month is Dec, run times will be 8.
    const baseURL = 'https://opensocialsecurity.com/';
    const firstMonth = personADobM % 12 + 1;
    const firstYear = Math.floor(personADobY + 62 + personADobM / 12);
    const lastMonth = personADobM;
    const lastYear = personADobY + 70;
    let magicString;
    let mainArray = new Array(2); // 2*9, if month is Dec, 2*8
    for (var i = 0; i < 2; i++) {
        mainArray[i] = [];
    }
    for (let i = firstYear; i <= lastYear; i++) {
        if (i == firstYear) {
            magicString = `&aFixedRBm=${firstMonth}&aFixedRBy=${firstYear}`;
            // console.log(`${i}th:`, magicString);
        }
        else if (i == lastYear) {
            magicString = `&aFixedRBm=${lastMonth}&aFixedRBy=${lastYear}`;
            // console.log(`${i}th:`, magicString);
        }
        else {
            magicString = `&aFixedRBm=1&aFixedRBy=${i}`;
            // console.log(`${i}th:`, magicString);
        }
        const targetURL = `${baseURL}?aGender=${personAGender}&aDOBm=${personADobM}&aDOBd=${personADobD}&aDOBy=${personADobY}&aPIA=${personAPIA}&aFiled=true${magicString}`;
        const response = await fetch(`https://api.apify.com/v2/actor-tasks/sOa6Rge6OlaxJs5TR/run-sync-get-dataset-items/`, {
            method: 'post',
            body: JSON.stringify({
                url: targetURL,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer apify_api_Nt71Ia1RmU92JvZCzy7u5qx5jQtScn1WFPVw`,
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resultArray = await response.json();
        if (resultArray.length === 0 || !resultArray[0].data) {
            throw new Error('No data found');
        }
        const mainResult = resultArray[0].data;
        mainArray[0][i - firstYear] = mainResult[0][1];
        mainArray[1][i - firstYear] = mainResult[1][1];
    }
    console.log('OpenScocialSecurityValues', mainArray);
    return mainArray;
}



