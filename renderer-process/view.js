const { ipcRenderer } = require('electron')
const nom = require('./lib/nom')

import ListOfGames, { locateGames } from './components/listOfGames.js'
import games from './games.js'

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

function other(games, setView) {
    return nom.els([
        nom.el('h2', 'Header'),
        nom.el('button', {
            children: 'Go back',
            onclick: () => { setView('listOfGames') }
        })
    ])
}

const views = {
    listOfGames: () => nom.mount(ListOfGames(games, setView)),
    other: () => nom.mount(other(games, setView))
}

let currentView
const view = document.getElementById('view')

function setView(viewId) {
    const nextView = views[viewId]
    if (!nextView) throw new Error('Missing viewId: `' + viewId + '`')
    if (currentView) currentView.unmount()
    view.appendChild(currentView = nextView())
}

setView('listOfGames')
locateGames(games)
