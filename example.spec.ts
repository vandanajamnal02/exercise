import { test, expect } from '@playwright/test';
const fs = require('fs')
const { convertArrayToCSV } = require('convert-array-to-csv');
const converter = require('convert-array-to-csv');
const { parse } = require("csv-parse");
const csv = require('csvtojson')

/**
 * Redirected to 'History by Store' page and selected 8 locations from the dropdown.
 * Accessing webpage table data and perform assertion on the same
 */

test('test 2', async ({ page }) => {
  await page.goto('https://app.tryloop.ai/login/password');
  await page.getByTestId('login-email').getByRole('textbox').fill('qa-engineer-assignment@test.com');
  await page.getByTestId('login-password').getByRole('textbox').fill('QApassword123$');
  await page.getByTestId('login-button').click();
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.getByRole('button', { name: '3P Chargebacks' }).click();
  await page.getByRole('link', { name: 'History by Store' }).click();
  await page.getByRole('button', { name: 'All (109) Locations' }).click();
  await page.getByLabel('Unselect All (109)').uncheck();

  const locationToBeSelected = ['Artisanal Aroma', 'Blissful Bites Banquet', 'Blissful Bites Bistro','Celestial Cuisine Corner','Coastal Cravings','Culinary Canvas','Culinary Carousel Cove','Culinary Cascade']
  for(const location of locationToBeSelected){
    await page.getByLabel(location).getByRole('checkbox').check();
  }
  await page.waitForTimeout(3000);
  const applyButton = page.getByTestId('applyBtn').click();
  await page.waitForTimeout(15000);

  const table = page.locator('table');


  const column = page.locator('th h6');
  const rows = table.locator('tbody tr');
  const tbody = table.locator('tbody');


  // const numberOfColumn = await column.count();
  const numberOfRows = await rows.count();

  let aug2023Sum=0;
  let sept2023Sum=0;
  let Oct2023Sum=0;
  let nov2023Sum=0;
  let dec2023Sum=0;
  let jan2024Sum=0;
  let Feb2024Sum=0;

  for(let i = 0; i<numberOfRows-2; i++) {
    let tableRow = await tbody.locator('tr').nth(i);
    
    aug2023Sum += Number((await tableRow.locator('td h6').nth(1).textContent())?.replace('$',''));
    sept2023Sum += Number((await tableRow.locator('td h6').nth(2).textContent())?.replace('$',''));
    Oct2023Sum += Number((await tableRow.locator('td h6').nth(3).textContent())?.replace('$',''));
    nov2023Sum += Number((await tableRow.locator('td h6').nth(4).textContent())?.replace('$',''));
    dec2023Sum += Number((await tableRow.locator('td h6').nth(5).textContent())?.replace('$',''));
    jan2024Sum += Number((await tableRow.locator('td h6').nth(6).textContent())?.replace('$',''));
    Feb2024Sum += Number((await tableRow.locator('td h6').nth(7).textContent())?.replace('$',''));
    await page.waitForTimeout(1000);
  }
  let nov2023Sum1 = Number(await nov2023Sum.toFixed(2));
  await page.waitForTimeout(1000);
  let tableResultRow = await tbody.locator('tr').last();
  expect(Number((await tableResultRow.locator('td h6').nth(1).textContent())?.replace('$',''))).toEqual(aug2023Sum);
  expect(Number((await tableResultRow.locator('td h6').nth(2).textContent())?.replace('$',''))).toEqual(sept2023Sum);
  expect(Number((await tableResultRow.locator('td h6').nth(3).textContent())?.replace('$',''))).toEqual(Oct2023Sum);
  expect(Number((await tableResultRow.locator('td h6').nth(4).textContent())?.replace('$',''))).toEqual(nov2023Sum1);
  expect(Number((await tableResultRow.locator('td h6').nth(5).textContent())?.replace('$','')?.replace(',',''))).toEqual(dec2023Sum);
  expect(Number((await tableResultRow.locator('td h6').nth(6).textContent())?.replace('$','')?.replace(',',''))).toEqual(jan2024Sum);
  expect(Number((await tableResultRow.locator('td h6').nth(7).textContent())?.replace('$',''))).toEqual(Feb2024Sum);
});

/**
 * Steps :
 * 1.  Redirecting to transactions tab and selecting location as 'Artisan Alchemy' and 'Blissful Buffet'  and grubhub as Marketplaces.
 * 2. Selected 20 rows views as we were having total 14 results in the table.
 * 3.  Created a map to save all the data table values rows wise.
 * 4. Creating a csv file from webpage data table
 * 5. Downloading a csv file from the download option.
 * 6. reading csv data for both of the csv's and asserting the data comparision
 */

test('verifying csv data', async ({page})=> {
  await page.goto('https://app.tryloop.ai/login/password');
  await page.getByTestId('login-email').getByRole('textbox').fill('qa-engineer-assignment@test.com');
  await page.getByTestId('login-password').getByRole('textbox').fill('QApassword123$');
  await page.getByTestId('login-button').click();
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.getByRole('button', { name: '3P Chargebacks' }).click();
  await page.getByRole('link', { name: 'Transactions' }).click();
  await page.waitForTimeout(8000);
  await page.getByRole('button', { name: 'All (109) Locations' }).click();
  await page.getByLabel('Unselect All (109)').uncheck();
  const locationToBeSelected = ['Artisan Alchemy', 'Blissful Buffet'];
  for(const location of locationToBeSelected){
    await page.getByLabel(location).getByRole('checkbox').check();
  }
  await page.getByTestId('applyBtn').click();
  await page.getByRole('button', { name: 'Marketplaces' }).click();
  await page.getByLabel('Unselect All (3)').uncheck();
  await page.getByLabel('Grubhub').getByRole('checkbox').check()
  await page.getByTestId('applyBtn').click()
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'rows' }).click();
  await page.getByRole('option', { name: '20 rows' }).click();
  await page.waitForTimeout(5000);
  
  let tableData =  page.locator('table')
  let tableHead =  page.locator('thead')
  let tableHeadRow = tableHead.locator('tr')
  let tbody = tableData.locator('tbody')
  let rows =  tbody.locator('tr')
  let tableRowCount = await rows.count()
  let coulmnNameofTablehead = tableHeadRow.locator('th')
  let tableHeadColumnCount = await coulmnNameofTablehead.count()
  let mapData = new Map()
  let csvrowbkp : any[] = []
  let csvrow : any[] = []
  let header : any[] = []
  let colCount = 0;
  let mapKeyCount = 0;


// to get all the datatable headers
  for(let i = 0; i < tableHeadColumnCount ; i++){
    let curentHeadColumn = await coulmnNameofTablehead.nth(i).textContent();
    header.push(curentHeadColumn);
  }

  // to read webpage table data and save the data to a map

  for (let i = 0; i < tableRowCount; i++) {
    csvrow = [];
    let tableRow = await tbody.locator('tr').nth(i);
    let tableColumn = await tableRow.locator('td');
    let tableColumnCount = await tableColumn.count();
    if(i==0)
    {
      colCount = tableColumnCount;
    }    
    if(tableColumnCount!=colCount){
      csvrow.push(await csvrowbkp[0]);
      csvrow.push(await csvrowbkp[1]);
      csvrow.push(await csvrowbkp[2]);
    }
    for (let j = 0; j < tableColumnCount; j++) {
      let currentColumnValue = await tableColumn.nth(j).textContent();
      csvrow.push(currentColumnValue);
  }
  csvrowbkp = csvrow;
  mapData.set(mapKeyCount++,csvrow)
  }

// create a final array to generate csv file
let finalArray : any = [];
for(let j = mapData.size-1; j >= 0; j--){
  finalArray.push(mapData.get(j));
}
const csvFromArrayOfArrays = convertArrayToCSV(finalArray , {
  header,
  separator: ';'
});


// Generating a csv file of the webpage datatable
fs.writeFileSync('output.csv',csvFromArrayOfArrays, err => {
  console.log('csv generated successfully')
} )

// Downloading data from the webpage
  const downloadPromise = page.waitForEvent('download');
  page.getByTestId('FileDownloadOutlinedIcon').click();
  const download = await downloadPromise;
  await download.saveAs('./' + download.suggestedFilename());


let createdCsv : any = [];
let downloadedCsv : any = []

// Getting created csv file order id in a list.

const createdCsv1 = async () => { 
  return new Promise(function(resolve, reject) {
    fs.createReadStream('./output.csv').pipe(parse({ delimiter: "\\n", from_line: 2 }))
    .on("data",  function (row1) {
       row1.forEach( (line) => {
        const fields =  line.split(";");
        createdCsv.push(fields[0].replace('#',''))
       console.log("csv length",createdCsv.length);
      });
    })
    .on("error",  function (error) {
       console.log( error.message);
    })
    .on("end",  function () {
      console.log("finished");
      resolve(createdCsv);
    });
  });
}
// Getting Downloaded csv file order id in a list.

const downloadedCsv1 = async () => {
  return new Promise(function(resolve, reject) {
    fs.createReadStream('./chargebacks_payouts_overview.csv').pipe(parse({ delimiter: "\\n", from_line: 2 }))
    .on("data",  function (row1) {
       row1.forEach( (line) => {
        const fields =  line.split(",");
        downloadedCsv.push(fields[0])
       console.log("csv length", downloadedCsv.length);
      });
    })
    .on("error",  function (error) {
       console.log( error.message);
    })
    .on("end",  function () {
      console.log("finished");
      resolve(downloadedCsv);
    });
})
}
createdCsv = await createdCsv1();
downloadedCsv = await downloadedCsv1();

// comparing orderid in both csv files
expect(createdCsv.length).toEqual(downloadedCsv.length);
expect(createdCsv).toEqual(downloadedCsv);

})