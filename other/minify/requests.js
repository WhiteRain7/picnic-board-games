/**
 * @typedef {Object} Game
 * @property {string} name
 * @property {string} owner
 * @property {number} difficulty - BGG rating from 1 (easy) to 5 (very hard)
 * @property {{ min: number, max: number }} time - time range (like 10-15, in minutes)
 * @property {{ min: number, max: number }} players - min and max possible players
 * @property {number} age - min allowed age to play game
 * @property {string} quality - comment about quality
 * @property {string} comment - other comments
 * @property {string} category
 * @property {string} description - game description
 *
 * -1 for all non-specified numerals
 */

/**
 * @returns {Promise<{ range: string, values: Array<Array<string>> }>}
 * @private
 */
async function _get () {
    return await REQUEST.then(r => {
        if (r.status >= 400) {
            throw Error(`HTTP status ${r.status}: ${r.statusText}`)
        }
        else return r
    }).then(r=>r.json()).catch(() => ({ values: [] }))
}

/**
 * @param {string} raw - "x-y", "x" or ""
 * @returns {{ min: number, max: number }}
 * @private
 */
function _rangeFrom (raw) {
    if (!raw) {
        return { min: -1, max: -1 }
    }
    else if (raw.includes('-')) {
        let a = raw.split('-').map(Number)
        return { min: a[0], max: isNaN(a[1]) ? 999 : a[1] }
    }
    else {
        return { min: parseInt(raw), max: parseInt(raw) }
    }
}
/**
 * @param {string} raw - "x+" or ""
 * @returns {number}
 * @private
 */
function _ageFrom (raw) {
    if (!raw) {
        return -1
    }
    else {
        let found = raw.match(/\d+/)
        return found ? parseInt(found[0]) : -1
    }
}

/**
 * @param {{ range: string, values: Array<Array<string>> }} data
 * @returns {Array<Game>}
 * @private
 */
function _parse (data) {
    /** @type {Array<Game>} */
    let games = []

    data.values.shift()

    for (let row of data.values) {
        if (row.length === 0) {
            break
        }

        games.push({
            name: row[0],
            owner: row[1],
            difficulty: row[2] ? parseFloat(row[2].replace(',', '.')) : -1,
            time: _rangeFrom(row[3]),
            players: _rangeFrom(row[4]),
            age: _ageFrom(row[5]),
            quality: row[6],
            comment: row[7],
            category: row[8],
            description: row[9],
        })
    }

    return games.toSorted((a, b) => a.name.localeCompare(b.name))
}

async function getData () {
    return await _get().then(_parse)
}