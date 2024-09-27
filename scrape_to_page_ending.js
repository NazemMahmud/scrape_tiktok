const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
    try {
        const titktokUsername = "ishowspeed";

        const browser = await puppeteer.launch({
            ignoreHTTPSErrors: true,
            headless: false, // to show response in browser
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--ignore-certificate-errors',
                '--ignore-certificate-errors-spki-list'
            ],
        });

        const page = await browser.newPage();

        // Set a custom user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Navigate to the page and wait for the content to load
        await page.goto(`https://www.tiktok.com/@${titktokUsername}`, {
            waitUntil: 'networkidle0',
            timeout: 60000 // Increase timeout to 60 seconds
        });

        // Function to scroll the page until no more content is loaded
        const scrollToEnd = async () => {
            let previousHeight = await page.evaluate('document.body.scrollHeight');
            let endReached = false;

            while (!endReached) {
                await page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });

                // Wait for some time to allow new content to load
                await page.waitForTimeout(2000);

                const currentHeight = await page.evaluate('document.body.scrollHeight');

                // Check if the page height hasn't changed
                if (currentHeight === previousHeight) {
                    endReached = true;
                } else {
                    previousHeight = currentHeight;
                }
            }
            console.log("Reached the end of the page.");
        };

        // Scroll to the bottom until no more content is loaded
        await scrollToEnd();

        console.log("Finished scrolling. Extracting data...");

        // Extract the hrefs from the divs
        /*
        const hrefs = await page.$$eval('div.css-1uqux2o-DivItemContainerV2', divs => {

            return divs.map(div => {
                const anchor = div.querySelector('a');
                return anchor ? anchor.href : null;
            }).filter(href => href !== null);
        });

        console.log('Extracted hrefs:', hrefs);
        console.log(`Total hrefs extracted: ${hrefs.length}`);
        */

        // Close the browser
        await browser.close(); // if you want to see the view in browser, comment this line
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();