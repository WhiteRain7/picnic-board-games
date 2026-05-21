let poptargets = {}

/**
 * @param {Array<{ category: string, desc: string, major: true }>} data
 * @returns {void}
 */
function initPoptargets (data) {
    let parent = document.createElement('div')
    let pop
    let index = 1
    for (let cat of data) {
        pop = document.createElement('div')
        pop.id = `pop${index ++}`
        pop.setAttribute('popover', '')
        pop.classList.add('popover')
        pop.innerHTML = `<dfn>${cat.category}</dfn><br/>${cat.desc}`
        parent.appendChild(pop)
        poptargets[cat.category] = pop
    }
    document.body.appendChild(parent)
}

/**
 * @param {Array<{ category: string, desc: string, major: true }>} data
 * @returns {void}
 */
function initCategories (data) {
    let container = document.getElementById('categories-body').children[1]
    container.innerHTML = ''
    let hidden = []

    /** @param {{ category: string, desc: string, major: true }} category */
    function create (category) {
        let button = document.createElement('button')
        button.classList.add('button')
        button.type = 'button'
        button.title = category.desc
        let span = document.createElement('span')
        span.innerText = category.category
        button.appendChild(span)

        if (!category.major) {
            button.classList.add('hidden')
            hidden.push(button)
        }

        button.addEventListener('click', event => {
            let button = event.currentTarget
            button.ariaSelected = button.ariaSelected === 'true' ? 'false' : 'true'
            if (button.ariaSelected === 'true') {
                filters.categories.add(category.category)
            }
            else {
                filters.categories.delete(category.category)
            }
            applyFilters()
        })

        button.addEventListener('contextmenu', event => {
            if (window.matchMedia('(pointer: coarse)').matches) {
                event.preventDefault()
                poptargets[category.category]?.showPopover()
            }
        })

        return button
    }

    for (let category of data.filter(c => c.major)) {
        container.appendChild(create(category))
    }
    container.lastElementChild.style = 'margin-bottom: 10px'

    for (let category of data.filter(c => !c.major)) {
        container.appendChild(create(category))
    }
    container.lastElementChild.style = 'margin-bottom: 10px'

    let button = document.createElement('button')
    button.classList.add('button', 'extra')
    button.type = 'button'
    let span = document.createElement('span')
    span.innerText = 'Показать ещё'
    button.appendChild(span)

    button.addEventListener('click', event => {
        button.ariaSelected = button.ariaSelected === 'true' ? 'false' : 'true'
        for (let btn of hidden) {
            btn.classList.toggle('hidden', button.ariaSelected !== 'true')
        }
        if (button.ariaSelected === 'true') {
            button.firstElementChild.innerText = 'Скрыть'
            button.lastElementChild.innerText = button.lastElementChild.innerText.replace('+', '-')
        }
        else {
            button.firstElementChild.innerText = 'Показать ещё'
            button.lastElementChild.innerText = button.lastElementChild.innerText.replace('-', '+')
        }
    })

    container.appendChild(button)

    let mod = document.getElementById('filter-category-mod')
    mod?.addEventListener('click', event => {
        filters.categoriesAll = mod.value === 'and'
        applyFilters()
    })
}

/**
 * @param {Array<{ category: string, desc: string, major: true }>} data
 * @param {Array<{ elem: HTMLElement, game: Game }>} list
 * @returns {Promise<void>}
 */
async function fillCategories (data, list) {
    let el, cats, cat, dataCat, button, span
    let amount = new Map

    amount.set('показать ещё', `+ ${data.reduce((s, v) => (s + !v.major), 0)} кат`)

    list.forEach(entry => {
        if (!entry.game.category) return
        el = entry.elem.querySelector('.category')
        cats = entry.game.category.split(/,\s*/g)
        el.innerText = ''

        outer:
        for (cat of cats) {
            amount.set(cat, (amount.get(cat) ?? 0) + 1)
            el.appendChild(new Text(', '))
            for (dataCat of data) {
                if (dataCat.category === cat) {
                    button = document.createElement('button')
                    button.type = 'button'
                    button.classList.add('cat')
                    button.innerText = cat
                    button.setAttribute('popovertarget', poptargets[dataCat.category].id)
                    el.appendChild(button)

                    continue outer
                }
            }
            span = document.createElement('span')
            span.classList.add('cat')
            span.innerText = cat
            el.appendChild(span)
        }

        el.firstChild.remove()
    })

    let container = document.getElementById('categories-body').children[1]
    for (let button of container.children) {
        span = document.createElement('span')
        span.classList.add('soft')
        span.innerText = ` ${amount.get(button.firstElementChild.innerText.toLowerCase()) || 0}`
        button.appendChild(span)
    }
}

window.addEventListener('load', async function () {
    const categories = await CATEGORIES.then(r => r.json())
    initPoptargets(categories)
    initCategories(categories)
    document.getElementById('categories-filters').removeAttribute('inert')
    await fillCategories(categories, await listQueue)
})