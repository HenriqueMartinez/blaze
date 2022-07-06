const { Telegraf } = require('telegraf');

class H027Client extends Telegraf {

    constructor(token) {
        super(token)

        this.START_MESSAGE = '🤖 Estamos online.';
        this.SESSION = 'VIP'
        this.URL = 'https://blaze.com/pt/games/';
        this.GAME = 'double';
        this.TIMEOUT = 5000;
        this.BROWSER_FETCHER_VERSION = 818858;
        this.ROULETTE_LENGTH = 16;
        this.ADMINISTRATOR_ID = 1574115552;
    }

    async login() {
        try {
            this.launch();
            console.log(this.START_MESSAGE);

            this.commandBot();
            this.metricsBlaze();

            process.once('SIGINT', () => this.stop('SIGINT'));
            process.once('SIGTERM', () => this.stop('SIGTERM'));
        } catch (error) {
            console.log('Error in connection of API!');
        }
    }

    async commandBot() {
        this.start(async (ctx) => {
            if (ctx.message.from.id == this.ADMINISTRATOR_ID) {
                await ctx.reply('<b>❗ O menu de configuração foi iniciado com sucesso.</b>', { parse_mode: 'HTML' });
            }
        });

        this.help(async (ctx) => {
            if (ctx.message.from.id == this.ADMINISTRATOR_ID) {
                await ctx.reply(`<b>📝 Comandos disponíveis</b>\n\n<b>/setsession</b> - Alterar o tipo de sessão.\n<b>/setgame</b> - Alterar o modo de jogo.\n<b>/setgale</b> - Setar a quantia máxima de gales.\n<b>/setmaintenance</b> - Colocar/retirar o robô de manutenção.\n<b>/showstats</b> - Ver o resultado atual do placar.\n<b>/resetstats</b> - Resetar o placar.`, { parse_mode: 'HTML' });
            }
        });

        this.command('setsession', async (ctx) => {
            if (ctx.message.from.id == this.ADMINISTRATOR_ID) {
                console.log('Sessão alterada.');
            }
        });
    }

    async metricsBlaze() {
        const puppeteer = require('puppeteer-extra');
        
        const StealthPlugin = require('puppeteer-extra-plugin-stealth');
        puppeteer.use(StealthPlugin());
        
        const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
        puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
        
        const parseRouletteFromElements = require('./modules/parseRouletteFromElements');
        const isSameRouletteColors = require('./modules/isSameRouletteColors');
        const delay = require('./modules/delay');

        const puppeteerLaunchOptions = {
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-gpu",
              "--no-first-run",
            ],
            defaultViewport: null,
            timeout: this.TIMEOUT,
            headless: true,
        };

        const defaultOptions = {
            waitMs: 5000,
            includeNumber: false,
            proxyServer: "",
            proxyUsername: "",
            proxyPassword: "",
        };

        const { waitMs, includeNumber, proxyServer, proxyUsername, proxyPassword } = { ...defaultOptions, waitMs: 2000, includeNumber: true };

        if (proxyServer) {
            puppeteerLaunchOptions.args.push(`--proxy-server=${proxyServer}`);
        }

        puppeteer.launch({ headless: true }).then(async (browser) => {
            const closeBrowser = async () => {
                await browser.close();
                process.exit(0);
            };
        
            process.on("SIGINT", closeBrowser);
            process.on("SIGTERM", closeBrowser);
    
            try {
                const page = await browser.newPage();
                await page.setDefaultNavigationTimeout(0);
    
                if (proxyUsername && proxyPassword) {
                    await page.authenticate({ username: proxyUsername, password: proxyPassword });
                }
    
                await page.goto(this.URL + this.GAME, { waitUntil: "networkidle2", timeout: 0 });
    
                let lastRoulette = [];
    
                while (true) {
                    const elements = await page.$$(".roulette-previous .sm-box");
                    
                    if (elements) {
                        const reverseElements = elements.reverse().slice(-this.ROULETTE_LENGTH);
                        const roulette = await parseRouletteFromElements(reverseElements, includeNumber);
    
                        const rouletteSlice = roulette.slice(-this.ROULETTE_LENGTH);
                        const hasChanged = !isSameRouletteColors(rouletteSlice, lastRoulette);
    
                        if (hasChanged) {
                           this.possibleResult({ roulette });
                        }
    
                        lastRoulette = rouletteSlice;
                    }
                    await delay(waitMs)
                }
            } catch (error) {
                console.log(error);
            } finally {
                closeBrowser();
            }
        });
    }

    async possibleResult({ roulette }) {
        console.log(roulette);
    }
}

module.exports = H027Client;