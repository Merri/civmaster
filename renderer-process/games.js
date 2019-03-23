const { ipcRenderer } = require('electron')

const games = [
    {
        id: 'civ4',
        isLoading: false,
        manifest: null,
        name: 'Sid Meier\'s Civilization IV',
        pathname: '',
        steamAppId: 3900
    },
    {
        id: 'civ4war',
        isLoading: false,
        manifest: null,
        name: 'Sid Meier\'s Civilization IV: Warlords',
        pathname: '',
        steamAppId: 3990
    },
    {
        id: 'civ4bts',
        isLoading: false,
        manifest: null,
        name: 'Sid Meier\'s Civilization IV: Beyond the Sword',
        pathname: '',
        steamAppId: 8800
    },
    {
        id: 'civ5',
        isLoading: false,
        manifest: null,
        name: 'Sid Meier\'s Civilization V',
        pathname: '',
        steamAppId: 8930
    },
    {
        id: 'civ6',
        isLoading: false,
        manifest: null,
        name: 'Sid Meier\'s Civilization VI',
        pathname: '',
        steamAppId: 289070
    },
    {
        id: 'civbe',
        isLoading: false,
        manifest: null,
        name: 'Sid Meier\'s Civilization: Beyond Earth',
        pathname: '',
        steamAppId: 65980
    }
]

const nom = require('./lib/nom')

const root = document.getElementById('games')
const order = ['civ6', 'civ5', 'civ4,civ4war,civ4bts', 'civbe']

function listOfGames(games) {
    const state = {
        items: order.map(id => ({
            id,
            games: id.split(',').map(id => games.find(game => game.id === id))
        }))
    }

    function nomGameItem(item) {
        if (item.nomEl) return item.nomEl

        return item.nomEl = nom.el('li.list-of-games__item', [
            nom.el('h3.game-header', item.games[0].name),
            nom.el(
                'dl.game-content',
                item.games.map(game => {
                    return [
                        nom.el('dt.game-content__name-header', 'Installation name:'),
                        nom.el('dd.game-content__name', () => ({
                            children: game.name + (game.isLoading ? ' (loading...)' : '')
                        })),
                        nom.el('dt.game-content__path-header', 'Path:'),
                        nom.el('dd.game-content__path', () => ({ children: game.pathname || '-' })),
                        nom.el('dt.game-content__language-header', 'Steam language:'),
                        nom.el('dd.game-content__language', () => ({
                            children: game.manifest ? game.manifest.UserConfig.language : '-'
                        }))
                    ]
                })
            )
        ])
    }

    return nom.els([
        nom.el('h2', 'Detected installations'),
        nom.el('ul.list-of-games', () => state.items.map(nomGameItem)),
        nom.el('button', () => {
            const isAnyGameLoading = games.some(game => game.isLoading)
            return { children: 'Refresh', disabled: isAnyGameLoading, onclick: locateGames }
        }),
        nom.el('br'),
        nom.el('button', () => {
            return { children: 'Index Civ5', disabled: isIndexingCiv5, onclick: indexCiv5 }
        })
    ])
}

function locateGames() {
    for (const game of games) {
        ipcRenderer.send('locate-installation', game)
        game.isLoading = true
    }
}

locateGames()

ipcRenderer.on('installation-located', (event, installation) => {
    const game = games.find(game => game.steamAppId === installation.steamAppId)
    if (game) {
        Object.assign(game, installation)
        game.isLoading = false
    }
})

let isIndexingCiv5 = false
const sources = {}
const index = {}

function indexCiv5() {
    if (isIndexingCiv5) {
        return
    }
    ipcRenderer.send('index-civ5', games.find(game => game.id === 'civ5'))
    isIndexingCiv5 = true
}

ipcRenderer.on('civ5-sources', (event, result) => {
    sources.civ5 = result
})

ipcRenderer.on('civ5-indexed', (event, result) => {
    index.civ5 = result
    isIndexingCiv5 = false
})

root.appendChild(nom.mount(listOfGames(games)))
