const links = document.querySelectorAll('link[rel="import"]')

Array.prototype.forEach.call(links, (link) => {
    const template = link.import.querySelector('.task-template')
    const clone = document.importNode(template.content, true)
    document.querySelector('.content').appendChild(clone)
})
