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
const ids = ['civ6', 'civ5', 'civ4,civ4war,civ4bts', 'civbe']

function listOfGames(games) {
    const state = {
        items: ids.map(id => {
            const firstId = id.split(',').shift()

            return {
                id,
                name: games.find(game => game.id === firstId).name
            }
        })
    }

    function nomGameItem(item) {
        if (item.nomEl) return item.nomEl

        return item.nomEl = nom.el('li.list-of-games__item', [
            nom.el('h3.game-header', item.name),
            nom.el(
                'dl.game-content',
                item.id.split(',').map(id => {
                    const game = games.find(game => game.id === id)
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

root.appendChild(nom.mount(listOfGames(games)))
