const fs = require('fs')
const fetch = require('node-fetch')
const { Response } = require('node-fetch')
const Pokemon = require('./pokemon')

module.exports = class PokeApi {
    _cacheFile = 'cache.json'

    constructor() { }

    /**
     * Retrieve Pokemon data by it's name or id
     * @param {string} param Name or id of pokemon
     */
    async searchPokemon(param) {
        let pokeList = this._loadCache()
        let i = pokeList.findIndex(p => p.name === param || p.id === param)
        if (i === -1) {
            i = pokeList.push(await this._getFromAPI(param)) - 1
            this._updateCache(pokeList)
        }
        return pokeList[i]
    }

    /**
     * Param should be the name or id of the Pokemon
     * @param {String} param Name or id of pokemon
     */
    async _getFromAPI(param) {
        let data = await fetch(`https://pokeapi.co/api/v2/pokemon/${param}/`)
            .then(res => this._isValidHTTPStatus(res))

        let loc = await fetch(data.location_area_encounters)
            .then(res => this._isValidHTTPStatus(res))

        let pokemon = new Pokemon()
        pokemon.parseData(data, loc)
        return pokemon
    }

    /**
     * Load cached pokemon data from local file
     */
    _loadCache() {
        try {
            let data = JSON.parse(fs.readFileSync(this._cacheFile))
            return Array.from(data)
                .map(v => new Pokemon(v))
                .filter(pokemon => !this.dataMoreThan7Days(pokemon.date))
        } catch (e) {
            return []
        }
    }

    /**
     * Update pokemon data to local file
     * @param {Array<Pokemon>} pokeList List of pokemons
     */
    _updateCache(pokeList) {
        fs.writeFileSync(this._cacheFile, JSON.stringify(pokeList))
    }

    /**
     * Check cached data is more than 7 days old
     * @param {number} date Cache date of the pokemon
     */
    _dataMoreThan7Days(date) {
        let timeDifference = Math.abs(new Date().getTime() - date)
        let dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24))
        return dayDifference > 7
    }

    /**
     * @param {Response} res 
     * @returns {Promise<never> | Object} 
     */
    _isValidHTTPStatus(res) {
        if (res.status !== 200)
            return Promise.reject(res.statusText)
        return res.json()
    }
}