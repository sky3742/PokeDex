class Stats {
    /** @type {number} */ hp
    /** @type {number} */ attack
    /** @type {number} */ defense
    /** @type {number} */ specialattack
    /** @type {number} */ specialdefense
    /** @type {number} */ speed
}

class Location {
    /** @type {String} */        name
    /** @type {Array<String>} */ methods
}


module.exports = class Pokemon {
    /** @type {number} */          id
    /** @type {String} */          name
    /** @type {Array<String>} */   types
    /** @type {Stats} */           stats
    /** @type {Array<Location>} */ locations
    /** @type {number} */          date

    constructor(data) {
        if (data !== undefined) {
            this.id = data.id
            this.name = data.name
            this.types = data.types
            this.stats = data.stats
            this.locations = data.locations
            this.date = data.date
        }
    }

    /**
     * Parse raw data from API
     * @param {Object} info Pokemon info
     * @param {Object} loc Pokemon location data
     */
    parseData(info, loc) {
        this.id = info.id
        this.name = info.name
        this.date = new Date().getTime()
        this.types = Array.from(info.types).map(({ type }) => type.name)
        this.stats = {}
        this.locations = []

        Array.from(info.stats).forEach(v => {
            v.stat.name = v.stat.name.replace('-', '')
            this.stats[v.stat.name] = v.base_stat
        })

        Array.from(loc)
            .filter(v => v.location_area.name.includes('kanto'))
            .forEach(v => {
                let location = new Location()
                location.name = v.location_area.name
                location.methods = []
                Array.from(v.version_details).forEach(d => {
                    Array.from(d.encounter_details).forEach(m => {
                        if (!location.methods.some(method => method === m.method.name)) {
                            location.methods.push(m.method.name)
                        }
                    })
                })
                this.locations.push(location)
            })
    }

    /**
     * Get pokemon info in string
     */
    toString() {
        let location = ''
        this.locations.forEach(loc => {
            location += `
        Name    : ${loc.name}
        Methods : ${loc.methods.join(', ')}\n`
        })

        return `
        ${this.name} (ID: ${this.id})

        Types
        =====
        ${this.types.join(', ')}

        Stats
        =====
        HP    : ${this.stats.hp}
        ATK   : ${this.stats.attack}
        DEF   : ${this.stats.defense}
        SATK  : ${this.stats.specialattack}
        SDEF  : ${this.stats.specialdefense}
        SPEED : ${this.stats.speed}

        Locations
        =========
        ${(location === '') ? '-' : location.trim()}
        `
    }
}