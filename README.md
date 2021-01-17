z/OS JCL Jobs Dasboard
===

Made by Z09347 for [Master the Mainframe 2020 Grand Challenge](https://www.ibm.com/it-infrastructure/z/education/master-the-mainframe).

Requirements:

 * Nodejs v15.2.1 with NPM
 * Zowe-CLI with a profile configured

Getting started

 * Install server dependencies with `npm install --dev`
 * Run the server with `npx ts-node server.ts`
 * Build and run the front-end `cd frontend/ && npm install --dev && npm start`

The server uses Zowe SDKs to long poll z/OS Jobs REST API (using the configured
profile in Zowe) and expose the data over websockets on `http://localhost:8000`.

The front-end is hosted on `http://localhost:3000` and displays the jobs / updates
from the web-socket connection in an easy to monitor dashboard.