import  cheerio from 'cheerio';
import  puppeteer from 'puppeteer';
import  axios from 'axios';
import dotenv from 'dotenv'
import * as _ from 'lodash';

export default class StatementScrapper{
    private codesMemo: Map<string, string> = new Map<string, string>();
    private statements : string[] = [];
    private groupId : string | undefined = undefined;
    private contestId : string | undefined = undefined;
    private cookies : string | undefined = undefined;
    private cfUsername : any = "";
    private cfPassword : any = ""; 

    constructor(groupid : string , contestid : string, cfusername : any , cfpassword : any ){
        this.groupId = groupid;
        this.contestId = contestid;
        this.cfPassword = cfpassword
        this.cfUsername = cfusername;
    }

    public run = async () => {
        let authCookies: any[];
        let parsedCookies: string;
    
        if (!this.cookies) {
          authCookies = await this.login();
          parsedCookies = authCookies
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');
          this.cookies = parsedCookies;
        } else {
          parsedCookies = this.cookies;
        }
        let statementsurl = this.generateStatementsUrl();
        let statementsString = await this.getStatements(statementsurl, parsedCookies);
        console.log(statementsString);
        if(statementsString?.includes("Hareedy$$$ is a very dangerous criminal")){
            console.log("YES");
        }
        else console.log("NO");
    }

    private getStatements = async (statementUrl : string, cookies: string) => {
        
        const result = await axios.get(statementUrl, {
          headers: {
            Cookie: cookies,
          },
        });
    
        const $ = cheerio.load(result.data);
        this.codesMemo.set(statementUrl, $('.ttypography').text());
        return this.codesMemo.get(statementUrl);
    };

    private async login() {
        console.log('[CF LOGIN] START');
        const loginUrl = 'https://codeforces.com/enter';
        const browser = await puppeteer.launch({
          args: ['--no-sandbox'],
          timeout: 0,
        });
        const page = await browser.newPage();
        
        await page.goto(loginUrl, { timeout: 0 });
        await page.type('input[name="handleOrEmail"]', this.cfUsername);
        await page.type('input[name="password"]', this.cfPassword);
        await page.click('input[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'load', timeout: 0 });
        const cookies = await page.cookies();
        browser.close();
    
        console.log('[CF LOGIN] DONE');
        return cookies;
    }

    private generateStatementsUrl(){
        return `https://codeforces.com/group/${this.groupId}/contest/${this.contestId}/problems`;
    }
};
dotenv.config();
let scrapper : StatementScrapper= new StatementScrapper(
    "Arlr9f6B5E", "302050", "", ""
    );
scrapper.run();