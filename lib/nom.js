const isBrowser = 'window' in global

function returnNull() { return null }

// var declares the variables to our scope even if isBrowser === false (but these variables will be undefined)
if (isBrowser)
    // optimize minified JS size
    var hasNode = 'Node' in window,
        Array = window.Array,
        document = window.document,
        flatten = Array.prototype.concat,
        Node = window.Node,
        // Object.prototype.toString.call() is the most compatible way to see if something is a function
        objFn = '[object Function]',
        objToStr = Object.prototype.toString,
        // typeof is fastest way to check if a function but older IEs don't support it for that and Chrome had a bug
        fn = 'function',
        canTypeOfFn = typeof returnNull === fn && typeof /./ !== fn,
        // textToDOM is text generator helper element
        textToDOM = document.createElement('div'),
        useTC = 'textContent' in textToDOM;

// applies properties to object or DOM node, adds render method to elements and returns the object
function render(obj, props) {
    var item, originalProps = props, prop, value,
        existingNode, node, nodeIndex, nodes, nodesToRemove = [];
    // we need to have an object of some sort
    if (obj == null) return obj;
    // see if it is a DOM element without a render method
    if ((hasNode ? obj instanceof Node : obj.nodeType > 0) && !obj.render)
        obj.render = function() {
            var node = obj.firstChild;
            // see if we need to render self
            render(obj, originalProps);
            // call render of all the children
            while (node) {
                if (canTypeOfFn ? typeof node.render === fn : objToStr.call(node.render) === objFn)
                    node.render();

                node = node.nextSibling;
            }
        };
    // if it is a function then assume it returns properties
    if (canTypeOfFn ? typeof props === fn : objToStr.call(props) === objFn)
        props = props.bind(obj)();
    // if it is a string then assume it is JSON
    else if (typeof props === 'string' && props.charCodeAt(0) === 0x7B) // = '{'
        props = JSON.parse(props);
    // should be an object now
    if (typeof props !== 'object')
        return obj;
    // array is expected to contain child nodes
    if (Array.isArray(props))
        props = {children: props};
    // apply each property
    for (prop in props) {
        if (!props.hasOwnProperty(prop)) continue;
        value = props[prop];
        // special case for dealing with children
        if (prop === 'children' && obj.childNodes) {
            node = true;
            nodeIndex = 0;
            if (typeof value === 'function') value = value(obj);
            // shallow flatten to a one dimensional array, eg. [[a], [b, [c]]] -> [a, b, [c]]
            nodes = Array.isArray(value) ? flatten.apply([], value) : [value];
            // the following will reorganize nodes and update text nodes in order
            existingNode = obj.firstChild;
            while (existingNode) {
                // do we need to figure out a new node or string to work with?
                if (node === true)
                    while(
                        (node = nodes[nodeIndex++]) &&
                        !(typeof node === 'string' || (hasNode ? node instanceof Node : node.nodeType > 0))
                    );
                // see if a string needs to be updated or added
                if (typeof node === 'string') {
                    // text nodes are simply replaced with new content
                    if (existingNode.nodeType === 3) {
                        if (existingNode.nodeValue !== node) existingNode.nodeValue = node;
                        existingNode = existingNode.nextSibling;
                    // add a text node here as that is the best assumption we can make
                    } else
                        obj.insertBefore(document.createTextNode(node), existingNode);
                    // request next node/string
                    node = true;
                // see if this is a Nom extended node
                } else if (
                    canTypeOfFn
                    ? typeof existingNode.render === fn
                    : objToStr.call(existingNode.render) === objFn
                ) {
                    // have we ran out of nodes?
                    if (!node) {
                        // abandon ship!
                        nodesToRemove.push(existingNode);
                        existingNode = existingNode.nextSibling;
                    } else {
                        // order has changed so move another node here
                        if (existingNode !== node)
                            obj.insertBefore(node, existingNode);
                        // in any other case we can just go ahead and compare the next node
                        else
                            existingNode = existingNode.nextSibling;
                        // request next node/string
                        node = true;
                    }
                // ignore this element, it does not interest us
                } else
                    existingNode = existingNode.nextSibling;
            }
            // remove the nodes that are no longer with us
            while (nodesToRemove.length)
                obj.removeChild(nodesToRemove.pop());
            // create a fragment to host multiple nodes, otherwise use the parent node
            var fra = (nodes.length - nodeIndex > 0) ? document.createDocumentFragment() : obj;
            // add nodes that are missing
            while (nodes.length >= nodeIndex) {
                // add text node
                if (typeof node === 'string') fra.appendChild(document.createTextNode(node));
                // add DOM element
                else if (hasNode ? node instanceof Node : node.nodeType > 0) fra.appendChild(node);
                // add anything else even if supporting this may be a bit dangerous
                else fra.appendChild(_fragment(node));

                node = nodes[nodeIndex++];
            }
            // see if there is a fragment to be added to the main node object
            if (fra !== obj && fra.childNodes.length)
                obj.appendChild(fra);
        // skip functions
        } else if (canTypeOfFn ? typeof obj[prop] === fn : objToStr.call(obj[prop]) === objFn);
        // apply subproperties like style if value is an object
        else if (typeof value === 'object') {
            if (obj[prop] != null)
                for (item in value)
                    if (value.hasOwnProperty(item) && obj[prop][item] !== value[item])
                        obj[prop][item] = value[item];
        }
        // simply set the property
        else if (obj[prop] !== value)
            obj[prop] = value;
    }
    // and we're done
    return obj;
}

// takes element or creates an element, applies properties to the element and returns the element
function _h(element, props, children) {
    if (children != null) {
        switch (typeof children) {
            case 'function':
            case 'string':
            case 'object':
                break;
            case 'boolean':
            case 'number':
                children = children.toString();
                break;
            default:
                children = String(children);
        }
    }
    var cssishParts, index = 0;
    // functions need no processing here
    if (canTypeOfFn ? typeof props !== fn : objToStr.call(props) !== objFn) {
        // sanitate against no props
        if (props == null)
            props = {};
        // see if props are really props, make them children if not so
        switch (typeof props) {
            case 'object':
                if (children == null) {
                    // do nothing more if it isn't an array
                    if (Array.isArray(props)) props = { children: props };
                } else {
                    props.children = children
                }
                break;
            case 'string':
                props = { children: props };
                break;
            case 'boolean':
            case 'number':
                props = props.toString();
                props = { children: props };
                break;
            default:
                props = { children: children || props };
        }
    }
    // see if we need to build an element
    if (typeof element === 'string') {
        cssishParts = element.match(/([#.]?[^#.]+)/g);
        element = document.createElement(cssishParts[0])
        while (++index < cssishParts.length) {
            switch(cssishParts[index].charCodeAt(0)) {
                case 0x23: // #
                    element.id = cssishParts[index].slice(1);
                    break;
                case 0x2E: // .
                    element.className = cssishParts[index].slice(1);
                    break;
            }
        }
    }
    // assign new properties and add Nom's rendering capabilities to the element
    return render(element, props);
};

// takes nodes, strings, or arrays of the aforementioned, returns a fragment
function _fragment(nodes) {
    var fragment = document.createDocumentFragment(), node, nodeIndex = 0, nodeTag;
    // create a real array out of everything given
    nodes = flatten.apply([], arguments);
    // nodes isn't really containing nodes yet, but we make them be ones
    while (nodes.length > nodeIndex) {
        node = nodes[nodeIndex++];
        // nodes are easy to add in right away
        if (hasNode ? node instanceof Node : node.nodeType > 0) {
            fragment.appendChild(node);
        // strings
        } else if (typeof node === 'string') {
            // let a div do the hard work
            if (useTC) { textToDOM.textContent = node } else { textToDOM.innerText = node };
            // capture the children to our fragment
            while (textToDOM.firstChild)
                fragment.appendChild(textToDOM.firstChild);
        // recursive call for arrays
        } else if (Array.isArray(node)) {
            fragment.appendChild(_fragment.apply(this, node));
        }
    }
    // rainbows!
    return fragment;
}

// takes a fragment or same stuff as els, mounts them for automatic render, returns a fragment
function _mount(fragment) {
    var mounts = [], node, nodes = [], nodeIndex = 0;
    // make sure we work with a fragment; support skipping a call to els
    if (hasNode ? !(fragment instanceof Node && fragment.nodeType === 11) : fragment.nodeType !== 11)
        fragment = _fragment.apply(this, arguments);
    // get to know our original children
    while (fragment.childNodes.length > nodeIndex) {
        // remember all original childNodes of the fragment so we can restore them to fragment on unmount
        nodes.push(node = fragment.childNodes[nodeIndex++]);
        // gather additional reference of Nom rendered element
        if (canTypeOfFn ? typeof node.render === fn : objToStr.call(node.render) === objFn)
            mounts.push(node);
    }
    // ends rendering and removes all original children from the document and returns the fragment
    fragment.unmount = function() {
        // stop render execution by clearing all active mounts
        mounts.length = 0;
        // restore all nodes back to the original fragment
        while (nodes.length)
            fragment.appendChild(nodes.shift());
        // return the fragment
        return fragment;
    }
    // takes care of keeping the nodes up-to-date
    function render() {
        var index = mounts.length, mount;

        while (index) {
            mount = mounts[--index];
            // has the node been removed?
            if (!mount.parentElement)
                mounts.splice(index, 1);
            // are we responsible for the render?
            else if (
                canTypeOfFn
                ? typeof mount.parentElement.render !== fn
                : objToStr.call(mount.parentElement.render) !== objFn
            )
                mount.render();
        }
        // keep rendering as long as there is something we can be responsible of
        if (mounts.length) requestAnimationFrame(render);
    }
    // initial render call
    requestAnimationFrame(render);
    // magitec!
    return fragment;
}

export const h = isBrowser ? _h : returnNull
export const fragment = isBrowser ? _fragment : returnNull
export const mount = isBrowser ? _mount : returnNull

// v0.1.0 compat
const nom = {
    el: h,
    els: fragment,
    mount: mount
}

export default nom
