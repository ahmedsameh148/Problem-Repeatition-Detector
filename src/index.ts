import dotenv from "dotenv";
import { run, polyLogin, cfLogin, polygonParseStatement, cfParseStatements } from "./scraper/StatementsScraper";

dotenv.config();

/////////////////////////
const tempRun = (htmlPath) => {

    let http = require('http');
    let fs = require('fs');

    const PORT = 8080;

    fs.readFile(htmlPath, function (err, html) {

        if (err) throw err;

        http.createServer(function (request, response) {
            response.writeHeader(200, { "Content-Type": "text/html" });
            response.write(html);
            response.end();
        }).listen(PORT);
    });

    const url = `http://localhost:${PORT}/`;

    return url;
};

const testProblemUrl = tempRun('test_pages/Statements-Polygon.html');
/////////////////////////

run().then(async (browser) => {

    // codeforces
    const cfPage = await cfLogin(browser);
    const cfProblems = await cfParseStatements(cfPage, 0, ' ');

    console.log(cfProblems.length);
    console.log(cfProblems[0]);


    // polygon
    const polyPage = await polyLogin(browser);

    const url = testProblemUrl;
    const polygonProblem = await polygonParseStatement(polyPage, url, 0, ' ');

    console.log(polygonProblem);
    console.log(polygonProblem);

    // close
    browser.close();

}).catch((err: any) => {
    console.log(err);
});
