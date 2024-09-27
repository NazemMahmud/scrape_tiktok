const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

/**
 * this is to scrape fixed number of items, like latest 40 items
 */
(async () => {
    try {
        const titktokUsername = "ishowspeed";
        const lastItem = 40;

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

        // Function to get the number of loaded divs with the target class
        const getDivCount = async () => {
            return await page.$$eval('div.css-1uqux2o-DivItemContainerV2', divs => divs.length);
        };

        // Function to scroll the page
        const scrollPage = async () => {
            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
            // Wait for any potential new content to load
            await page.waitForNetworkIdle({idleTime: 500, timeout: 5000}).catch(() => {});
        };

        let divCount = 0;
        let previousHeight = 0;

        // put a condition here to stop, otherwise if it takes to load for 100+ contents it will take times
        while (divCount < lastItem) {
            await scrollPage();

            const currentHeight = await page.evaluate('document.body.scrollHeight');
            if (currentHeight === previousHeight) {
                console.log("Reached the end of the page");
                break;
            }
            previousHeight = currentHeight;

            divCount = await getDivCount();
            console.log(`Current div count: ${divCount}`);
        }

        console.log(`Final div count: ${divCount}. Extracting hrefs...`);

        // Extract the hrefs from the divs
        const hrefs = await page.$$eval('div.css-1uqux2o-DivItemContainerV2', divs => {
            return divs.map(div => {
                const anchor = div.querySelector('a');
                return anchor ? anchor.href : null;
            }).filter(href => href !== null);
        });

        console.log('Extracted hrefs:', hrefs);
        console.log(`Total hrefs extracted: ${hrefs.length}`);

        await browser.close(); // if you want to see the view in browser, comment this line
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();