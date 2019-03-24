const { ipcRenderer } = require('electron')
import { fragment, h } from '/lib/nom.js'

const order = ['civ6', 'civ5', 'civ4,civ4war,civ4bts', 'civbe']

function GameItem(item) {
    if (item.nomEl) return item.nomEl

    return item.nomEl = h('li.list-of-games__item', [
        h('h3.game-header', item.games[0].name),
        h(
            'dl.game-content',
            item.games.map(game => [
                h('dt.game-content__name-header', 'Installation name:'),
                h('dd.game-content__name', () => ({
                    children: game.name + (game.isBusy ? ' (loading...)' : '')
                })),
                h('dt.game-content__path-header', 'Path:'),
                h('dd.game-content__path', () => ({ children: game.pathname || '-' })),
                h('dt.game-content__language-header', 'Steam language:'),
                h('dd.game-content__language', () => ({
                    children: game.manifest ? game.manifest.UserConfig.language : '-'
                })),
                h('dd.game-content__language',
                    null,
                    h('pre', null, () => (game.langDB ? JSON.stringify(game.manifest, null, 4) : '-'))
                )
            ])
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

    return fragment(
        h('h2', 'Detected installations'),
        h('ul.list-of-games', () => state.items.map(GameItem)),
        h('button', () => {
            const isAnyGameBusy = games.some(game => game.isBusy)
            return { children: 'Refresh', disabled: isAnyGameBusy, onclick: handleLocate }
        }),
        h('br'),
        h('button', () => {
            const isCiv5Busy = games.some(game => game.id === 'civ5' && game.isBusy)
            return {
                children: 'Index Civ5',
                disabled: isCiv5Busy,
                onclick: handleIndex
            }
        }),
        h('button', ({ children: 'Show other', onclick: () => { setView('other') } }))
    )
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
