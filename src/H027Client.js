const { Telegraf } = require('telegraf');
const { doubleMetrics } = require('./games/doubleMetrics');
const HMessages = require('./messagesClass');

let doubleData = {
    messageID: null,
    messageGaleID: null,
    standard: null,
    isEqual: false,
    countGale1: 0,
    countGale2: 0,
    gale: 0,
    counterTipSent: 0,
    countGreen: 0,
    countWhite: 0,
    countRed: 0,
    lastColor: '',
    colors: {},
}

class H027Client extends Telegraf {

    constructor(token) {
        super(token)

        this.START_MESSAGE = '🤖 Estamos online.';
        this.SESSION = 'VIP';
        this.URL = 'https://blaze.com/pt/games/';
        this.GAME = 'double';
        this.TIMEOUT = 5000;
        this.BROWSER_FETCHER_VERSION = 818858;
        this.ROULETTE_LENGTH = 16;
        this.PERCENTAGE_TO_PLAY = 55;
        this.ADMINISTRATOR_ID = 1574115552;
        this.channelFREE = -1001713559396;
        this.channelVIP = -1001588651954;

        this.HMessages = new HMessages();
        this.analyzing = this.HMessages.AnalyzingEntry();
        this.alert = this.HMessages.Alert();
        this.info = this.HMessages.Info();
        this.cover = this.HMessages.Cover();
        this.entryBlack = this.HMessages.Entryblack();
        this.entryRed = this.HMessages.EntryRed();
        this.abortEntry = this.HMessages.AbortEntry();
        this.green = this.HMessages.Green();
        this.greenWithWhite = this.HMessages.GreenWithWhite();
        this.red = this.HMessages.Red();
    }

    async login() {
        try {
            this.launch();
            console.log(this.START_MESSAGE);

            doubleMetrics(async ({ roulette }) => { this.metricDouble({ roulette }); }, { this: this, waitMs: 1000 })

            process.once('SIGINT', () => this.stop('SIGINT'));
            process.once('SIGTERM', () => this.stop('SIGTERM'));
        } catch (error) {
            console.log('Error in connection of API!');
        }
    }

    async loadCommand(commandPath, commandName) {
        try {
            this.start(async (ctx) => {
                if (ctx.message.from.id == this.ADMINISTRATOR_ID) {
                    await ctx.reply('<b>❗ Use /help para ver a lista de comandos.</b>', { parse_mode: 'HTML' });
                }
            });

            this.help(async (ctx) => {
                console.log('xereca');
            });
            
            this.command(commandName, async (ctx) => {
                console.log(commandName);
            });
            
            console.log(`Command ${commandName} has been loaded!`);
            return false;
        } catch (error) {
            return `Unable to load command ${commandName}: ${error}`;
        }
    }

    async sendMessage(message) {
        try {
            const toSend = await this.telegram.sendMessage(this.channelVIP, message, { parse_mode: 'HTML' });

            return toSend.message_id;
        } catch (error) {
            console.log('Error send message!');
        }
    }

    async replyMessage({ message, messageID }) {
        try {
            const toReply = await this.telegram.sendMessage(this.channelVIP, message, { reply_to_message_id: messageID, parse_mode: 'HTML' });
            return toReply.message_id;
        } catch (error) {
            console.log('Error reply message!');
        }
    }

    async deleteMessageWithID(message) {
        try {
            await this.telegram.deleteMessage(this.channelVIP, message);
        } catch (error) {
            console.log('Error in delete message!');
        }
    }

    async metricDouble({ roulette }) {
        doubleData.lastColor = roulette.reverse()[0];
        doubleData.colors = roulette;

        if (!doubleData.isEqual && doubleData.lastColor != 'white' && doubleData.standard == null) {
            if (doubleData.messageID != null) await this.deleteMessageWithID(doubleData.messageID);
            this.sendMessage(await this.analyzing).then(async (messageID) => {
                doubleData.messageID = messageID;
                doubleData.isEqual = true;
                console.log('--------------------------------------------------');
                console.log('+ ⚠️         Analisando possível entrada!     ⚠️   +');
                console.log('--------------------------------------------------');
            });
        }

        if (doubleData.isEqual && doubleData.standard == null) {
            if (doubleData.messageID != null) await this.deleteMessageWithID(doubleData.messageID);
            doubleData.messageID = null;

            let totalResults = {};
            doubleData.colors.map(x => x.color).forEach(function(i) { totalResults[i] = (totalResults[i] || 0) + 1; });
            
            let toCompare = [];
            toCompare.push(totalResults.red, totalResults.black);
        
            const min = Math.min(...toCompare);
            const max = Math.max(...toCompare);

            const percentageToPlay = await percentage(max, 16);

            if (percentageToPlay >= this.PERCENTAGE_TO_PLAY) {
                if (min == max || doubleData.lastColor == 'white') {
                    this.sendMessage(`${await this.abortEntry}`).then(async (messageID) => {
                        doubleData.messageID = messageID;
                        doubleData.standard = null;
                        doubleData.isEqual = false;
                        console.log('--------------------------------------------------');
                        console.log('+ ⚠️         A entrada foi abortada!      ⚠️   +');
                        console.log('--------------------------------------------------');
                    });                
                } else if (toCompare[1] == min) {
                    this.sendMessage(`Jogar no ${await this.entryBlack} + ${await this.cover}\n${await this.info}`).then(async (messageID) => {
                        doubleData.messageID = messageID;
                        doubleData.counterTipSent += 1;
                        doubleData.standard = 'black';
                        doubleData.isEqual = false;
                        console.log('--------------------------------------------------');
                        console.log('+ ⚠️         A entrada foi confirmada!       ⚠️   +');
                        console.log('--------------------------------------------------');
                    });           
                } else if (toCompare[0] == min) {
                    this.sendMessage(`Jogar no ${await this.entryRed} + ${await this.cover}\n${await this.info}`).then(async (messageID) => {
                        doubleData.messageID = messageID;
                        doubleData.counterTipSent += 1;
                        doubleData.standard = 'red';
                        doubleData.isEqual = false;
                        console.log('--------------------------------------------------');
                        console.log('+ ⚠️         A entrada foi confirmada!       ⚠️   +');
                        console.log('--------------------------------------------------');
                    });
                }
            }
        }

        if (!doubleData.isEqual && doubleData.standard != null) {
            if (doubleData.lastColor.color == doubleData.standard || doubleData.lastColor.color == 'white') {
                if (doubleData.messageGaleID != null) await this.deleteMessageWithID(doubleData.messageGaleID);
                if (doubleData.messageID != null) await this.replyMessage({ message: doubleData.lastColor.color == 'white' ? await this.greenWithWhite : await this.green, messageID: doubleData.messageID }).then(async (m) => {
                    doubleData.messageID = null;
                    doubleData.messageGaleID = null;
                    doubleData.standard = null;
                    doubleData.gale = 0;
                    doubleData.countGreen += 1;
                });
            } else {
                doubleData.gale += 1;
                if (doubleData.gale == 1) {
                    if (doubleData.messageID != null) await this.replyMessage({ message: `<i>❗️ Vamos de primeiro gale!</i>`, messageID: doubleData.messageID }).then(async (m) => {
                        doubleData.messageGaleID = m;
                    });
                } else if (doubleData.gale == 2) {
                    if (doubleData.messageGaleID != null) await this.deleteMessageWithID(doubleData.messageGaleID);
                    if (doubleData.messageID != null) await this.replyMessage({ message: `<i>❗️ Vamos de segundo gale!</i>`, messageID: doubleData.messageID }).then(async (m) => {
                        doubleData.messageGaleID = m;
                    });
                } else if (doubleData.gale == 3) {
                    if (doubleData.messageGaleID != null) await this.deleteMessageWithID(doubleData.messageGaleID);
                    if (doubleData.messageID != null) await this.replyMessage({ message: await this.red, messageID: doubleData.messageID }).then(async (m) => {
                        doubleData.messageID = null;
                        doubleData.messageGaleID = null;
                        doubleData.standard = null;
                        doubleData.gale = 0;
                        doubleData.countRed += 1;
                    });
                }
            }
        }
    }
}

function percentage(partialValue, totalValue) {
    return ((100 * partialValue) / totalValue).toFixed(2);
} 

module.exports = H027Client;