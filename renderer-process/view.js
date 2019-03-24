const { ipcRenderer } = require('electron')
import { fragment, h, mount } from '/lib/nom.js'

import ListOfGames, { locateGames } from './views/ListOfGames.js'
import games from './state/games.js'

ipcRenderer.on('installation-located', (event, installation) => {
    const game = games.find(game => game.steamAppId === installation.steamAppId)
    if (game) {
        Object.assign(game, installation)
        game.isBusy = false
    }
})

ipcRenderer.on('civ5-sources', (event, result) => {
    const civ5 = games.find(game => game.id === 'civ5')
    civ5.sources = result
})

ipcRenderer.on('civ5-indexed', (event, result) => {
    const civ5 = games.find(game => game.id === 'civ5')
    civ5.isBusy = false
    civ5.langDB = result
})

function Other(games, setView) {
    return fragment(
        h('h2', 'Header'),
        h('button', { onclick: () => { setView('listOfGames') } }, 'Go back')
    )
}

const views = {
    listOfGames: setView => ListOfGames(games, setView),
    other: setView => Other(games, setView)
}

let currentView
const view = document.getElementById('view')

function setView(viewId) {
    const nextView = views[viewId]
    if (!nextView) throw new Error('Missing viewId: `' + viewId + '`')
    if (currentView) currentView.unmount()
    view.appendChild(currentView = mount(nextView(setView)))
}

setView('listOfGames')
locateGames(games)
