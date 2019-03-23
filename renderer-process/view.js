const { ipcRenderer } = require('electron')
const nom = require('./lib/nom')

import listOfGames, { locateGames } from './components/listOfGames.js'
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
            onclick: () => { setView('listGames') }
        })
    ])
}

const views = {
    listGames: () => nom.mount(listOfGames(games, setView)),
    other: () => nom.mount(other(games, setView))
}

let currentView
const view = document.getElementById('view')

function setView(view) {
    const nextView = views[view]
    if (!nextView) throw new Error('Missing view: `' + view + '`')
    if (currentView) currentView.unmount()
    view.appendChild(currentView = nextView())
}

setView('listGames')
locateGames(games)
