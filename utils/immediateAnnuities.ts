import { StateAbbr } from "@/types/backend.type";
/* gender 'M' or 'F' */
export async function annuities(premium: number, incomeStart: number, age: number, gender: string, state: StateAbbr) {

    var myHeaders = {};
    //console.log(data)
    let requestOptions: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Specify the content type as JSON
        },
        body: JSON.stringify({
            "annuity-data-1": "ar-start",
            "form_source": "H",
            "passed": "start",
            "income": "",
            "start_point": "/",
            "premium": premium,
            "income_start_date": incomeStart,
            "age": age,
            "gender": gender,
            "state": state,
            "joint_age": "0",
            "joint_gender": "0",
            "sub1": "GET+MY+QUOTE!"
        }),
        redirect: 'follow'
    };

    const response = await fetch("https://www.immediateannuities.com/information/annuity-rates-step-1.html", requestOptions);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.text();
    const tableMatch = result.match(/[\s\S]*?(<table[\s\S]*?>[\s\S]*?<\/table>)[\s\S]*/);
    const table = tableMatch ? tableMatch[1] : null;
    if (table) {
        const rows = table.matchAll(/<tr[\s\S]*?>(.*?)((?=<tr)|(?=<\/tr>))/g);
        const rowContents = Array.from(rows).map(row => row[1]);
        const rowContentsFirstElRemoved = rowContents.map(row => row.replace(/^<(td|th)>.*?<\/(td|th)>/, ''));
        const rowsExplanationRemoved = rowContentsFirstElRemoved.map(row => row.replace(/<span><div class="close-button"><\/div>Explanation:.*?<\/span>/g, ''));
        const rowsTooltipRemoved = rowsExplanationRemoved.map(row => row.replace(/&nbsp;<span.*?tooltip">.*?<\/span>/g, ''));
        let rowsCleaned = rowsTooltipRemoved.map(row => Array.from(row.matchAll(/(<th><span.*?>(.*?)<\/span>|<th>(.*?)<\/th>|<td><div>(.*?)<\/div>|<td>\$(.*?)<\/td>)/g)));
        console.log(rowsCleaned);

        rowsCleaned = rowsCleaned.map((row, index) => {
            if (index === 0 && row.length >= 2) {
              return [row[0], row[1]];
            } else {
              return [];
            }
          });
          
        // rowsCleaned = rowsCleaned.map((row, index) => {
        //     if (index === 0) {
        //         return [row[0][2], row[1][3]]
        //     }
        //     return [row[0][4].replace('&amp;', '&'), parseFloat(row[1][5].replace(',', ''))]
        // })
        console.log(rowsCleaned);
        return rowsCleaned;
    }
}
