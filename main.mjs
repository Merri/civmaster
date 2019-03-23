import fs from 'fs'
import glob from 'glob'
import path from 'path'

import { app, BrowserWindow, protocol } from 'electron'
import logger from 'electron-log'
import update from 'update-electron-app'

update({ logger })

const debug = /--debug/.test(process.argv[2])
const es6Path = __dirname.replace(/\/$/, '')

if (process.mas) app.setName('Civilization Master')

let mainWindow = null

function initialize() {
    makeSingleInstance()
    loadMainProcesses()

    function createWindow() {
        const windowOptions = {
            width: 1080,
            minWidth: 680,
            height: 840,
            title: app.getName(),
            webPreferences: {
                nodeIntegration: true
            }
        }

        if (process.platform === 'linux') {
            windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
        }

        mainWindow = new BrowserWindow(windowOptions)
        mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))

        // Launch fullscreen with DevTools open, usage: npm run debug
        if (debug) {
            mainWindow.webContents.openDevTools()
            mainWindow.maximize()
            require('devtron').install()
        }

        mainWindow.on('closed', () => {
            mainWindow = null
        })

        protocol.registerBufferProtocol('es6', function(req, callback) {
            fs.readFile(
                path.join(es6Path, req.url.replace('es6://', '')),
                function(e, data) {
                    callback({ mimeType: 'text/javascript', data })
                }
            )
        })
    }

    app.on('ready', () => {
        createWindow()
    })

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow()
        }
    })
}

function makeSingleInstance() {
    if (process.mas) return

    app.requestSingleInstanceLock()

    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
}

function loadMainProcesses() {
    const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
    files.forEach((file) => { require(file) })
}

initialize()
