const puppeteer = require('puppeteer-extra');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

const parseRouletteFromElements = require('./modules/parseRouletteFromElements');
const isSameRouletteColors = require('./modules/isSameRouletteColors');
const delay = require('./modules/delay');

const puppeteerLaunchOptions = {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--no-first-run',
    ],

    defaultViewport: null,
    timeout: 1000,
    headless: true,
};

const defaultOptions = {
    waitMs: 5000,
    proxyServer: '',
    proxyUsername: '',
    proxyPassword: '',
};

const doubleMetrics = async (callback, options) => {
    const { waitMs, proxyServer, proxyUsername, proxyPassword } = { ...defaultOptions, ...options };

    if (proxyServer) {
        puppeteerLaunchOptions.args.push(`--proxy-server=${proxyServer}`);
    }

    puppeteer.launch({ headless: true }).then(async (browser) => {
        const closeBrowser = async () => {
            await browser.close();
            process.exit(0);
        };
    
        process.on('SIGINT', closeBrowser);
        process.on('SIGTERM', closeBrowser);

        try {
            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0);

            if (proxyUsername && proxyPassword) {
                await page.authenticate({ username: proxyUsername, password: proxyPassword });
            }

            await page.goto(options.this.URL + options.this.GAME, { waitUntil: 'networkidle2', timeout: 0 });

            let lastRoulette = [];

            while (true) {
                const elements = await page.$$('.roulette-previous .sm-box');
                
                if (elements) {
                    const reverseElements = elements.reverse().slice(-options.this.ROULETTE_LENGTH);
                    const roulette = await parseRouletteFromElements(reverseElements);

                    const rouletteSlice = roulette.slice(-options.this.ROULETTE_LENGTH);
                    const hasChanged = !isSameRouletteColors(rouletteSlice, lastRoulette);

                    if (hasChanged) {
                        callback({ roulette });
                    }

                    lastRoulette = rouletteSlice;
                }
                
                await delay(waitMs);
            }
        } catch (error) {
            console.log(error);
        } finally {
            closeBrowser();
        }
    });
}

module.exports = doubleMetrics;