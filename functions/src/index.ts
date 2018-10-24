import * as functions from 'firebase-functions'
import { google } from 'googleapis'
const sheets = google.sheets('v4')

const spreadsheetId = '1JcHM9W_i-3UIvQzAkRIqJN79T-pUhBpxck9vS9-tZ00'

const serviceAccount = require('../serviceAccount.json')

const jwtClient = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: [ 'https://www.googleapis.com/auth/spreadsheets' ],  // read and write sheets
})
const jwtAuthPromise = jwtClient.authorize()

function compareDates(a,b) {
  if (a.date < b.date)
    return -1;
  if (a.date > b.date)
    return 1;
  return 0;
}

export const copyPracticesToSheet = functions.database.ref('/users/DN3HZYxlkKeuoksqG9hVR8bWuxH3').onUpdate(async change => {
  const data = change.after.val()

  const beersSpreadsheetData = [];
  const debitSpreadsheetData = [];
  const paidSpreadsheetData = [];

  // sort practices by 
  const players = data.players;
  const practices = [];

  for (const key in data.practices) {
    if (data.practices.hasOwnProperty(key)) {
      const practice = data.practices[key];
      practices.push({
        date: practice.date,
        comment: practice.comment,
        players: practice.players
      });
    }
  }
  practices.sort(compareDates);

  //build row A & B
  const rowA = ["Leikmenn"];
  const rowB = ["Athugasemd"];
  practices.forEach((practice) => {
    const date = new Date(practice.date);
    rowA.push(`${date.toDateString()}`);
    rowB.push(practice.comment);
  });

  beersSpreadsheetData.push(rowA);
  debitSpreadsheetData.push(rowA);
  
  beersSpreadsheetData.push(rowB);
  debitSpreadsheetData.push(rowB);

  // paid spreadsheet row A
  paidSpreadsheetData.push(["Leikmenn", "Búinn að borga æfingagjald"]);


  // build the player rows
  for (const key in players) {
    if (players.hasOwnProperty(key)) {
      const player = players[key];
      const playerBeerRow = [player.name];
      const playerDebitRow = [player.name];

      const playerPaidRow = [player.name, player.paid ? "Já" : "Nei"];

      practices.forEach((practice) => {
        let beersCount = 0;
        let debitAmount = 0;
        practice.players.forEach((practicePlayer) => {
          if(key === practicePlayer.key) {
            beersCount = practicePlayer.beers;
            debitAmount = practicePlayer.debit;
          }
        });
        playerBeerRow.push(beersCount);
        playerDebitRow.push(debitAmount);
      });

      beersSpreadsheetData.push(playerBeerRow);
      debitSpreadsheetData.push(playerDebitRow);
      paidSpreadsheetData.push(playerPaidRow);
    }
  }

    await jwtAuthPromise
    await sheets.spreadsheets.values.update({
        auth: jwtClient,
        spreadsheetId: spreadsheetId,
        range: 'Leikmenn',  
        valueInputOption: 'RAW',
        requestBody: { values: paidSpreadsheetData }
    }, {})

    await sheets.spreadsheets.values.update({
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      range: 'Bjórar',  
      valueInputOption: 'RAW',
      requestBody: { values: beersSpreadsheetData }
  }, {})

  await sheets.spreadsheets.values.update({
    auth: jwtClient,
    spreadsheetId: spreadsheetId,
    range: 'Inneign',  
    valueInputOption: 'RAW',
    requestBody: { values: debitSpreadsheetData }
}, {})
})