const functions = require('firebase-functions');
const _ = require('lodash');
const {google} = require('googleapis');
const sheets = google.sheets('v4');

const spreadsheetId = 'YOUR_SPREADSHEET_ID_HERE';

//const serviceAccount = require('../serviceAccount.json');

/*const jwtClient = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: [ 'https://www.googleapis.com/auth/spreadsheets' ],  // read and write sheets
});

const jwtAuthPromise = jwtClient.authorize();

*/
exports.copyPracticesToSheet = functions.database.ref('/users/DN3HZYxlkKeuoksqG9hVR8bWuxH3').onUpdate(async (change) => {
    const data = change.after.val();
    console.log(data);
    return
    // Sort the scores.  scores is an array of arrays each containing name and score.
    /*const scores = _.map(data, (value, key) => [key, value]);
    scores.sort((a,b) => { return b[1] - a[1] });

    await jwtAuthPromise;

    await sheets.spreadsheets.values.update({
        auth: jwtClient,
        spreadsheetId: spreadsheetId,
        range: 'Leikmenn!A2:B7',  // update this range of cells
        valueInputOption: 'RAW',
        requestBody: { values: scores }
    }, {});*/
});
