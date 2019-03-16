const nom = require('./lib/nom')
const { games, getGameManifest, getGameName, getGamePath, isGameLoading, locateGames } = require('./lib/games')
const root = document.getElementById('games')
const keys = ['civ4,civ4war,civ4bts', 'civ5', 'civbe', 'civ6']

function listOfGames(games) {
    const state = {
        items: keys.map(key => ({
            key,
            name: games[key.split(',').shift()].name
        }))
    }

    function nomGameItem(item) {
        if (item.nomEl) return item.nomEl

        return item.nomEl = nom.el('li.list-of-games__item', [
            nom.el('h3.game-header', item.name),
            nom.el(
                'div.game-content',
                item.key.split(',').map(key => {
                    const children = [
                        nom.el('strong', getGameName(key)),
                        nom.el('br'),
                        nom.el('code', () => ({ children: getGamePath(key) || 'path unknown' })),
                        nom.el('br'),
                        nom.el('code', () => ({ children: getGameManifest(key) ? getGameManifest(key).UserConfig.language : 'not installed in Steam' }))
                    ]

                    return nom.el('p', () => ({
                        className: 'game-content__item ' + (isGameLoading(key) ? 'game-content__item--is-loading' : ''),
                        children
                    }))
                })
            )
        ])
    }

    return nom.els([
        nom.el('h2', 'Detected installations'),
        nom.el('ul.list-of-games', () => state.items.map(nomGameItem)),
        nom.el('button', () => {
            const isAnyGameLoading = Object.keys(games).some(key => isGameLoading(key))
            return { children: 'Refresh', disabled: isAnyGameLoading, onclick: () => locateGames() }
        })
    ])
}

locateGames()

root.appendChild(nom.mount(listOfGames(games)))
