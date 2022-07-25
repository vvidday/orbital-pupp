const puppeteer = require("puppeteer");
const URL = "https://orbital-frontend-hkdbcgmhp-vvidday.vercel.app/";

const delay = (time) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
};

describe("Playing default group while logged in", () => {
    beforeAll(async () => {
        require("dotenv").config();
        await page.goto("http://localhost:3000");
    });
    it("Default group has correct behaviour", async () => {
        // Sign in
        const signInButton = await page.$("#sign-in-btn");
        await signInButton.click();
        const usernameInput = await page.waitForSelector("#username_or_email");
        usernameInput.focus();
        await page.keyboard.type(process.env.USERNAME);
        const passwordInput = await page.$("#password");
        await passwordInput.focus();
        await page.keyboard.type(process.env.PASSWORD);
        const submitButton = await page.$("#allow");
        await submitButton.click();
        const defaultGroupBtn = await page.waitForSelector("#Default-group");
        await defaultGroupBtn.click();
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
        let nextButton = await page.waitForSelector("#next-btn");
        await delay(1500);
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
        // Wrong button (button that brings user to highscore page) should be in the document
        const wrongButton = await page.waitForSelector("#wrong-btn");
        expect(wrongButton).toBeDefined();
        // Next button should not be in the document
        nextButton = await page.$("#next-btn");
        expect(nextButton).toBeNull();
        // Click wrong button
        await wrongButton.click();
        // Wait for highscores to load
        const hsButton = await page.waitForSelector("#hs-btn");
        expect(hsButton).toBeDefined();
    });
});
