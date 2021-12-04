const readline = require('readline')
const { stdin: input, stdout: output } = require('process')
const rl = readline.createInterface({ input, output })

const PokeAPI = require('./pokeapi')
const poke = new PokeAPI()

function run() {
    rl.question('Please enter pokemon name or id (0 to exit): ', answer => {
        if (answer === '0') {
            rl.close()
        } else {
            poke.searchPokemon(answer)
                .then(pokemon => console.log(pokemon.toString()))
                .catch(err => console.log(err))
                .then(() => run())
        }
    })
}

run()