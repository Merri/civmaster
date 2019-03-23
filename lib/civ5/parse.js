import fs from 'fs'
import path from 'path'
import recursive from 'recursive-readdir'

import { addSqlToDatabase, addXmlToDatabase, getLangHelpers } from './language-database'

function allowOnlySqlAndXml(file, stats) {
    return !stats.isDirectory() && !/\.(xml|sql)$/i.test(file)
}

function by(a, b) {
    if (a < b) return -1
    if (a > b) return 1
    return 0
}

function sortByFileAndKey(obj) {
    return Object.keys(obj).sort(function(a, b) {
        return by(obj[a].filename, obj[b].filename) || by(a, b)
    }).reduce(function(out, key) {
        out[key] = obj[key]
        return out
    }, {})
}

export async function parseCiv5Language(pathname, lang) {
    const files = await recursive(pathname, [allowOnlySqlAndXml])
    const helper = getLangHelpers(lang)

    const Localization = files.sort().reduce(function(database, file) {
        const content = fs.readFileSync(file, { encoding: 'utf-8' }).replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        const filename = path.basename(file) // file.split(path.sep).join('/')

        if (filename.slice(-4).toLowerCase() === '.sql') {
            addSqlToDatabase(database, filename, content, helper)
        } else if (helper.xmlTableTag.test(content)) {
            addXmlToDatabase(database, filename, content, helper)
        }

        return database
    }, {})

    const json = Object.keys(Localization).reduce(function(json, key) {
        const item = Localization[key]

        if (Array.isArray(item)) {
            json[key] = item
            return json
        }

        Object.keys(item).forEach(function(key) {
            if (item[key].feature && !json.features.includes(item[key].feature)) {
                json.features.push(item[key].feature)
            }
        })

        json[key] = sortByFileAndKey(item)

        return json
    }, { features: [], Language: {}, conflicts: [] })

    json.features.sort()

    return json.features.reduce(function(sorted, feature) {
        sorted['Language.' + feature] = json['Language.' + feature]
        return sorted
    }, {
        features: json.features.length > 0 ? json.features : undefined,
        Language: json.Language,
        conflicts: json.conflicts.length > 0 ? json.conflicts : undefined
    })
}
