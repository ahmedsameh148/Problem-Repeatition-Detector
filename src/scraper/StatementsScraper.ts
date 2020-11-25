import puppeteer from 'puppeteer';


// login url
const polyLoginUrl = 'https://polygon.codeforces.com/login';
const cfLoginUrl = 'https://codeforces.com/enter'

// login form xpath
const ployLoginXpath = '//form/table/tbody/tr/td/'
const cfLoginXpath = '//form/table/tbody/tr/td/'

// config
const rememberMe = true;

const delay = (time) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

const run = async (headless: boolean = false, timeout = 0) => {

    const browser = await puppeteer.launch({ headless: headless, executablePath: process.env.Chrome });

    const polyLogin = async () => {

        const polyPage = (await browser.pages())[0];

        await polyPage.goto(polyLoginUrl, { waitUntil: 'load', timeout: timeout });

        const polyLoginForm = await polyPage.$x(ployLoginXpath + 'input');

        if (polyLoginForm.length < 2) {

            console.log('polygon - login form is not found');

            return;
        }

        await polyLoginForm[0].type(process.env.POLYGONE_USERNAME);
        await polyLoginForm[1].type(process.env.POLYGONE_PASSWORD);

        const check = await (await polyLoginForm[2].getProperty('checked')).jsonValue();

        if (!check && rememberMe) {

            await polyLoginForm[2].click();
        }

        await polyPage.keyboard.press('Enter');

        await delay(3000);

        const [send_anyway] = await polyPage.$x('//button[contains(., "Send anyway")]');

        if (send_anyway) {

            await send_anyway.click();
        }

        await polyPage.waitForNavigation({ waitUntil: 'networkidle0' });

        return polyPage;
    }


    const cfLogin = async () => {

        const cfPage = await browser.newPage();
        await cfPage.goto(cfLoginUrl, { waitUntil: 'load', timeout: timeout });

        const cfLoginForm = await cfPage.$x(cfLoginXpath + 'input');
        const formCheckbox = await cfPage.$x(cfLoginXpath + 'label/input');

        if (cfLoginForm.length < 2) {

            console.log('codeforces - login form is not found');

            return;
        }

        await cfLoginForm[0].type(process.env.CF_USERNAME);
        await cfLoginForm[1].type(process.env.CF_PASSWORD);

        const check = await (await formCheckbox[0].getProperty('checked')).jsonValue();

        if (!check && rememberMe) {

            await formCheckbox[0].click();
        }

        await cfPage.keyboard.press('Enter');
        await cfPage.waitForNavigation({ waitUntil: 'networkidle0' });

        return cfPage;
    }

    const cfParseStatements = async (sep) => {

        const cfPage = await cfLogin();

        const problemsettingUrl = `http://codeforces.com/contests/writer/${process.env.CF_USERNAME}`

        await cfPage.goto(problemsettingUrl, { waitUntil: 'load', timeout: timeout });

        const enterGroup = await cfPage.$x('//a[contains(., "Enter »")]');

        const problemsUrl = await Promise.all(enterGroup.map(async (a) => {
            return await (await a.getProperty('href')).jsonValue() + '/problems';
        }));

        const contestsProblem = await Promise.all(problemsUrl.map(async (url) => {

            (await cfPage.goto(url, { waitUntil: 'load', timeout: timeout }));
            const problemsBody = (await cfPage.$x('//div[@class="problem-statement"]'));

            return problemsBody;
        }));


        const strFormat = (str: string) => {

            return str.replace(/\n[0-9]/g, '');
        };

        const parseProblemBody = async (body, sep = '\n') => {

            const classes = ['header', 'input-specification', 'output-specification', 'sample-tests', 'note'];
            const problem = {};

            for (let i = 0; i < classes.length; i++) {

                const xpath = `div[@class="${classes[i]}"]`;
                const specNode = await body.$x(xpath);
                let text = ''

                for (let j = 0; j < specNode.length; j++) {
                    let val = await cfPage.evaluate(el => el.innerText, specNode[j]);
                    text += val + sep;
                }

                problem[classes[i]] = strFormat(text);
            }

            const pNode = await body.$x('div[not(@class)]/child::*');
            let text = '';

            for (let i = 0; i < pNode.length; i++) {
                let val = await cfPage.evaluate(el => el.innerText, pNode[i]);
                text += val + sep;
            }

            problem['statement'] = strFormat(text);

            return problem;
        };

        const problems = [];

        for (let i = 0; i < contestsProblem.length; i++) {
            for (let j = 0; j < contestsProblem[i].length; j++) {

                const problem = await parseProblemBody(contestsProblem[i][j], sep);

                problems.push(problem);
            }
        }

        return problems;
    }

    const polyPage = await polyLogin();
    const cfProblems = await cfParseStatements(' ');

    browser.close();

    return cfProblems;
};

export { run };