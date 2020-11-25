import dotenv from "dotenv";
import {run} from "./scraper/StatementsScraper";

dotenv.config();

run().then((cfProblems)=>{
    console.log(cfProblems.length);
    console.log(cfProblems[0]);
}).catch((err: any)=>{
    console.log(err);
});
