class HMessages {
    constructor() {
        this.analyzingEntry = "<b>⚠️ Analisando possível entrada</b>"
        this.confirmedEntry = "<b>⚠️Entrada Confirmada⚠️</b>"
        this.abortEntry = "<b>⚠️ ABORTAR ENTRADA ⚠️</b> \n\n ❌❌❌❌❌❌❌❌❌"
        this.entryRed = "🔴"
        this.entryblack = "⚫"
        this.green = "<b>WINNNN!</b> ✅✅ 🤑💰"
        this.red = "<b>REEED!</b> ❌❌😯💨"
        this.info = "2️⃣ Máximo <b>02 Martingale</b>"
        this.cover = "⚪"
        this.alert = "<b>⚠️ATENÇÃO⚠️</b>"
        this.balance = "📊 Balanço 📊"
        this.greenWithWhite = "<b>WINNNN!!</b>✅✅ 🤑💰\n\n<i>No Branco</i>⚪"
    }

    async AnalyzingEntry() {
        return this.analyzingEntry
    }

    async ConfirmedEntry() {
        return this.confirmedEntry
    }

    async AbortEntry() {
        return this.abortEntry
    }

    async EntryRed() {
        return this.entryRed
    }

    async Entryblack() {
        return this.entryblack
    }

    async EntryWhite() {
        return this.entryWhite
    }

    async Green() {
        return this.green
    }

    async GreenWithWhite() {
        return this.greenWithWhite
    }

    async Red() {
        return this.red
    }

    async Info() {
        return this.info
    }

    async Cover() {
        return this.cover
    }

    async Alert() {
        return this.alert
    }

    async Balance() {
        return this.balance
    }
}

module.exports = HMessages;