"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var cheerio = require("cheerio");
var puppeteer = require("puppeteer");
var axios_1 = require("axios");
var StatementScrapper = /** @class */ (function () {
    function StatementScrapper(groupid, contestid, cfusername, cfpassword) {
        var _this = this;
        this.codesMemo = new Map();
        this.statements = [];
        this.groupId = undefined;
        this.contestId = undefined;
        this.cookies = undefined;
        this.cfUsername = "";
        this.cfPassword = "";
        this.run = function () { return __awaiter(_this, void 0, void 0, function () {
            var authCookies, parsedCookies, statementsurl, statementsString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.cookies) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.login()];
                    case 1:
                        authCookies = _a.sent();
                        parsedCookies = authCookies
                            .map(function (cookie) { return cookie.name + "=" + cookie.value; })
                            .join('; ');
                        this.cookies = parsedCookies;
                        return [3 /*break*/, 3];
                    case 2:
                        parsedCookies = this.cookies;
                        _a.label = 3;
                    case 3:
                        statementsurl = this.generateStatementsUrl();
                        statementsString = this.getStatements(statementsurl, parsedCookies);
                        console.log(statementsString);
                        return [2 /*return*/];
                }
            });
        }); };
        this.getStatements = function (statementUrl, cookies) { return __awaiter(_this, void 0, void 0, function () {
            var result, $;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1["default"].get(statementUrl, {
                            headers: {
                                Cookie: cookies
                            }
                        })];
                    case 1:
                        result = _a.sent();
                        $ = cheerio.load(result.data);
                        this.codesMemo.set(statementUrl, $('.ttypography').text());
                        return [2 /*return*/, this.codesMemo.get(statementUrl)];
                }
            });
        }); };
        this.groupId = groupid;
        this.contestId = contestid;
        this.cfPassword = cfpassword;
        this.cfUsername = cfusername;
    }
    StatementScrapper.prototype.login = function () {
        return __awaiter(this, void 0, void 0, function () {
            var loginUrl, browser, page, cookies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[CF LOGIN] START');
                        loginUrl = 'https://codeforces.com/enter';
                        return [4 /*yield*/, puppeteer.launch({
                                args: ['--no-sandbox'],
                                timeout: 0
                            })];
                    case 1:
                        browser = _a.sent();
                        return [4 /*yield*/, browser.newPage()];
                    case 2:
                        page = _a.sent();
                        return [4 /*yield*/, page.goto(loginUrl, { timeout: 0 })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, page.type('input[name="handleOrEmail"]', this.cfUsername)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, page.type('input[name="password"]', this.cfPassword)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, page.click('input[type="submit"]')];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, page.waitForNavigation({ waitUntil: 'load', timeout: 0 })];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, page.cookies()];
                    case 8:
                        cookies = _a.sent();
                        browser.close();
                        console.log('[CF LOGIN] DONE');
                        return [2 /*return*/, cookies];
                }
            });
        });
    };
    StatementScrapper.prototype.generateStatementsUrl = function () {
        return "https://codeforces.com/group/" + this.groupId + "/contest/" + this.contestId + "/problems";
    };
    return StatementScrapper;
}());
exports["default"] = StatementScrapper;
;
var scrapper = new StatementScrapper("Arlr9f6B5E", "302050", process.env.CF_HANDLE, process.env.CF_PASSWORD);
scrapper.run();
