import convert from 'xml-js'

function identity(x) {
    return x
}

function parseFeature(input) {
    const feature = /^\s*(?:AND|WHERE)\s+EXISTS\s+\(\s*SELECT\s+\*\s+FROM\s+([^\s]+)\s+WHERE\s+(\w+)='([^']+)'\s+AND\s+Value=\s*(\d+)\s*\)\s*$/i.exec(input)
    if (!feature) return input
    return feature.slice(1).join(':')
}

function addToDatabase(database, key, value, helper) {
    const feature = ['Language', value.feature].filter(identity).join('.')
    if (!database[feature]) database[feature] = {}

    // comment out for extra debug info
    delete value.method

    if (database[feature][key] != null) {
        if (database[feature][key][helper.lang].text !== value[helper.lang].text) {
            if (!Array.isArray(database.conflicts)) database.conflicts = []
            database.conflicts.push({ key, ...value })
            console.error(
                '\nDUPLICATE CONFLICT!\n' + key + ' in ' + feature +
                '\nOld: ' +
                JSON.stringify(database[feature][key], null, '\t') +
                '\nNew: ' +
                JSON.stringify(value, null, '\t')
            )
        }
    } else {
        database[feature][key] = value
    }
}

export function addSqlToDatabase(database, filename, content, helper) {
    let result, part

    while ((result = helper.parseUpdate.exec(content)) !== null) {
        addToDatabase(database, result[2], {
            feature: parseFeature(result[3]),
            filename,
            [helper.lang]: {
                text: result[1].replace(/''/g, "'")
            },
            method: 'update'
        }, helper)
    }

    while ((result = helper.parseInsertUnion.exec(content)) !== null) {
        const feature = parseFeature(result[2])
        while ((part = helper.parseInsertUnionParts.exec(result[1])) !== null) {
            addToDatabase(database, part[1], {
                feature,
                filename,
                [helper.lang]: {
                    text: part[2].replace(/''/g, "'")
                },
                method: 'union'
            }, helper)
        }
    }

    while ((result = helper.parseInsertValues.exec(content)) !== null) {
        while ((part = helper.parseInsertValuesParts.exec(result[1])) !== null) {
            addToDatabase(database, part[1], {
                filename,
                [helper.lang]: {
                    text: part[2].replace(/''/g, "'")
                },
                method: 'values'
            }, helper)
        }
    }
}

function trimInnerWhiteSpace(text) {
    if (typeof text !== 'string') return text
    return text
        .replace(/\s{2,}/g, ' ')
        .replace(/ \[NEWLINE\]/g, '[NEWLINE]')
        // fix a bug in English translation
        .replace(/ \[NEWLINE\s/g, '[NEWLINE]')
        // fix a bug in Vox Populi XML
        .replace(/''/g, "'")
}

export function addXmlToDatabase(database, filename, content, helper) {
    const { GameData } = convert.xml2js(content, { compact: true, trim: true })
    const Text = GameData[Object.keys(GameData).find(key => helper.xmlTable.test(key))]

    if (Text == null) console.log('GameData', Object.keys(GameData))
    const Rows = (Array.isArray(Text.Row) ? Text.Row : [Text.Row]).filter(identity)
    const Updates = (Array.isArray(Text.Update) ? Text.Update : [Text.Update]).filter(identity)

    Rows.forEach(({ _attributes, Gender, Plurality, Text }) => {
        addToDatabase(database, _attributes.Tag, {
            filename,
            [helper.lang]: {
                text: trimInnerWhiteSpace(Text._text),
                gender: trimInnerWhiteSpace(Gender && Gender._text),
                plurality: trimInnerWhiteSpace(Plurality && Plurality._text)
            },
            method: 'Row'
        }, helper)
    })

    Updates.forEach(Update => {
        const { Gender, Plurality, Text } = Update.Set

        addToDatabase(database, Update.Where._attributes.Tag, {
            filename,
            [helper.lang]: {
                text: trimInnerWhiteSpace(Text && Text._text),
                gender: trimInnerWhiteSpace(Gender && Gender._text),
                plurality: trimInnerWhiteSpace(Plurality && Plurality._text)
            },
            method: 'Update'
        }, helper)
    })
}

export function getLangHelpers(lang) {
    return {
        lang,
        parseUpdate: new RegExp(
            '\\s*UPDATE\\s+Language_' +
            lang +
            '\\s+SET\\s+Text\\s*\\=\\s*\\\'(.*)\\\'\\s+WHERE\\s+Tag\\s*=\\s*\\\'([^\']+)\\\'(.*)?;',
            'gi'
        ),
        parseInsertUnion: new RegExp(
            '\\s*INSERT INTO\\s+Language_' +
            lang +
            '\\s+\\(\\s*Tag,\\s*Text\\s*\\)\\s*((?:\\bSELECT\\s*\\\'(?:[^\']+)\\\',\\s+\\\'(?:.*)\\\'\\s*(?:UNION ALL)?\\s+)+)(.*)?;',
            'gi'
        ),
        parseInsertUnionParts: /\s*SELECT\s*\'([^']+)\',\s+\'(.*)\'\s*(?:UNION ALL)?\s+/gi,
        parseInsertValues: new RegExp(
            '\\s*INSERT INTO\\s+Language_' +
            lang +
            '\\s+\\(\\s*Tag,\\s*Text\\s*\\)\\s*(?:-- .*\\n\\s*)?VALUES((?:\\s*\\(\\s*\\\'(?:[^\']+)\\\',\\s+\\\'(?:.*)\\\'\\s*\\)(?:,\\s*)?)+);',
            'gi'
        ),
        parseInsertValuesParts: /\s*\(\s*\'([^']+)\',\s+\'(.*)\'\s*\)(?:,\s*)?/gi,
        xmlTable: new RegExp('Language_' + lang, 'i'),
        xmlTableTag: new RegExp('<Language_' + lang + '>', 'gi')
    }
}
