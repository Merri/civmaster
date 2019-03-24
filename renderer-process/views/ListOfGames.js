const { ipcRenderer } = require('electron')
const nom = require('./lib/nom')

const order = ['civ6', 'civ5', 'civ4,civ4war,civ4bts', 'civbe']

function GameItem(item) {
    if (item.nomEl) return item.nomEl

    return item.nomEl = nom.el('li.list-of-games__item', [
        nom.el('h3.game-header', item.games[0].name),
        nom.el(
            'dl.game-content',
            item.games.map(game => {
                return [
                    nom.el('dt.game-content__name-header', 'Installation name:'),
                    nom.el('dd.game-content__name', () => ({
                        children: game.name + (game.isBusy ? ' (loading...)' : '')
                    })),
                    nom.el('dt.game-content__path-header', 'Path:'),
                    nom.el('dd.game-content__path', () => ({ children: game.pathname || '-' })),
                    nom.el('dt.game-content__language-header', 'Steam language:'),
                    nom.el('dd.game-content__language', () => ({
                        children: game.manifest ? game.manifest.UserConfig.language : '-'
                    })),
                    nom.el('dd.game-content__language', ({
                        children: nom.el('pre', () => ({
                            children: game.langDB ? JSON.stringify(game.manifest, null, 4) : '-'
                        }))
                    }))
                ]
            })
        )
    ])
}

export default function ListOfGames(games, setView) {
    const state = {
        items: order.map(id => ({
            id,
            games: id.split(',').map(id => games.find(game => game.id === id))
        }))
    }

    function handleIndex() {
        indexCiv5(games.find(game => game.id === 'civ5'))
    }

    function handleLocate() {
        locateGames(games)
    }

    return nom.els([
        nom.el('h2', 'Detected installations'),
        nom.el('ul.list-of-games', () => state.items.map(GameItem)),
        nom.el('button', () => {
            const isAnyGameBusy = games.some(game => game.isBusy)
            return { children: 'Refresh', disabled: isAnyGameBusy, onclick: handleLocate }
        }),
        nom.el('br'),
        nom.el('button', () => {
            const isCiv5Busy = games.some(game => game.id === 'civ5' && game.isBusy)
            return {
                children: 'Index Civ5',
                disabled: isCiv5Busy,
                onclick: handleIndex
            }
        }),
        nom.el('button', ({ children: 'Show other', onclick: () => { setView('other') } }))
    ])
}

export function locateGames(games) {
    for (const game of games) {
        if (!game.isBusy) {
            ipcRenderer.send('locate-installation', game)
            game.isBusy = true
        }
    }
}

function indexCiv5(civ5) {
    if (!civ5.isBusy) {
        ipcRenderer.send('index-civ5', civ5)
        civ5.isBusy = true
    }
}
