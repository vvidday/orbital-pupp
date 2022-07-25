//import "expect-puppeteer";
//import { puppeteer } from "puppeteer";
const puppeteer = require("puppeteer");
const URL = "https://orbital-frontend-hkdbcgmhp-vvidday.vercel.app/";

const delay = (time) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
};

describe("Main page", () => {
    beforeAll(async () => {
        await page.goto("http://localhost:3000");
    });

    // it("Toggles between dark and light mode", async () => {
    //     const [button] = await page.$x(
    //         "//button[contains(text(), 'Toggle Mode')]"
    //     );
    //     if (button) {
    //         await button.click();
    //     }
    //     const x = await button.evaluate((e) =>
    //         getComputedStyle(e).getPropertyValue("background-color")
    //     );
    //     console.log(x);
    // });

    it("Default group test (Unlogged) has correct behaviour", async () => {
        // Click on "Default" group to start game
        const div = await page.$("#group0");
        await div.click();

        // Wait for game to load
        let answerElement = await page.waitForSelector("#answer");
        // The element should render on the page
        expect(answerElement).toBeDefined();
        // Store the answer in answer
        let answer = await answerElement.evaluate((e) => e.textContent);
        expect(answer).toBeDefined();

        /*
            Test for correct choice
        */
        let correctButton = null;
        // Select all choice buttons
        let buttons = await page.$$("button[id*=choice]");
        // Iterate through buttons and click on the correct one
        for (let i = 0; i < buttons.length; i++) {
            const text = await buttons[i].evaluate((e) => e.textContent);
            if (text === answer) {
                correctButton = buttons[i];
                await buttons[i].click();
                break;
            }
        }
        await delay(150);
        // Upon selection of answer, cursor property should be set to "not-allowed" to prevent further input.
        const cursor = await correctButton.evaluate((e) =>
            getComputedStyle(e).getPropertyValue("cursor")
        );
        expect(cursor).toBe("not-allowed");
        // Upon selection of answer, iframe containing the embedded tweet should be displayed. It is sufficient to check the id since that is how twitter-embed implements it.
        const iframe = await page.$("iframe[id='twitter-widget-0']");
        expect(iframe).toBeDefined();

        // Click on next button
        let nextButton = await page.$("#next-btn");
        await nextButton.click();

        /*
            Test for wrong choice
        */
        answerElement = await page.waitForSelector("#answer");
        expect(answerElement).toBeDefined();
        answer = await answerElement.evaluate((e) => e.textContent);
        expect(answer).toBeDefined();
        buttons = await page.$$("button[id*=choice]");
        // Find wrong button and click it
        for (let i = 0; i < buttons.length; i++) {
            const text = await buttons[i].evaluate((e) => e.textContent);
            if (text !== answer) {
                await buttons[i].click();
                break;
            }
        }
        await delay(150);
        // Next button should not be in the document
        nextButton = await page.$("#next-btn");
        expect(nextButton).toBeNull();
        // Wrong button (button that brings user to highscore page) should be in the document
        const wrongButton = await page.$("#wrong-btn");
        expect(wrongButton).toBeDefined();
        // Click wrong button
        await wrongButton.click();

        // Wait for submit score component to load
        const input = await page.waitForSelector("#submit-name-input");
        // Focus on input and type
        await page.focus("#submit-name-input");
        await page.keyboard.type("PuppeteerDefaultAnon");
        // Submit score
        const submitButton = await page.$("#submit-name-btn");
        await submitButton.click();

        // Wait for highscores to load
        const hsButton = await page.waitForSelector("#hs-btn");
        await hsButton.click();
        await delay(1500);
        // Iterate through names and find entry corresponding to PuppeteerDefaultAnon
        const names = await page.$$("div[id*=name]");
        for (let i = 0; i < names.length; i++) {
            const e = await names[i].evaluate((e) => e.textContent);
            if (e.trim() === "PuppeteerDefaultAnon") {
                // Check if score is 1
                const scoreEle = await page.$(`#score${i}`);
                const score = await scoreEle.evaluate((e) => e.textContent);
                expect(score).toBe("1");
                break;
            }
        }
    });
});
