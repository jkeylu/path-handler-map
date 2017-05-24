
/** ':' */
const COLON = 58;
/** '/' */
const SLASH = 47;
/** '*' */
const STAR = 42;

export type Kind = 1 | 2 | 3;

/** Static */
const skind: Kind = 1;
/** Params */
const pkind: Kind = 2;
/** Any */
const akind: Kind = 3;

export {
    COLON,
    SLASH,
    STAR,
    skind,
    pkind,
    akind
}

export interface HandlerAndPnames {
    handler: Function;
    pnames: string[];
}

export interface MethodToHandlerMap {
    [method: string]: HandlerAndPnames;
}

export interface NodeChildren {
    [label: number]: Node;
}

export interface FindResult {
    found: boolean;
    handler: Function;
    pnames: string[];
    pvalues: string[];
}

export class Node {
    kind: Kind;
    label: number;
    prefix: string;
    children: NodeChildren;
    handlerMap: MethodToHandlerMap;
    parent: Node = null;

    get signature() {
        var cn: Node = this,
            prefixs: string[] = [];
        while (cn != null) {
            prefixs.unshift(cn.prefix);
            cn = cn.parent;
        }
        return prefixs.join('');
    }

    constructor(
        kind: Kind = skind,
        prefix: string = '/',
        children: NodeChildren = Object.create(null),
        handlerMap: MethodToHandlerMap = Object.create(null)
    ) {
        this.kind = kind;
        this.label = prefix.charCodeAt(0);
        this.prefix = prefix;
        this.children = children;
        this.handlerMap = handlerMap;

        for (var l in this.children) {
            this.children[l].parent = this;
        }
    }

    reset(kind: Kind = skind, prefix: string = '/') {
        this.kind = kind;
        this.label = prefix.charCodeAt(0);
        this.prefix = prefix;
        this.children = Object.create(null);
        this.handlerMap = Object.create(null);
    }

    addChild(c: Node) {
        c.parent = this;
        this.children[c.label] = c;
    }

    addHandler(method: string, handler: Function, pnames: string[]) {
        if (method && typeof handler == 'function') {
            this.handlerMap[method] = { handler, pnames };
        }
    }

    addPrefixPnames(prefixPnames: string[]) {
        var methods = Object.keys(this.handlerMap),
            labels = Object.keys(this.children),
            i: number,
            len: number,
            method: string,
            label: number;

        for (i = 0, len = methods.length; i < len; i++) {
            method = methods[i];
            this.handlerMap[method].pnames = prefixPnames.concat(this.handlerMap[method].pnames);
        }

        for (i = 0, len = labels.length; i < len; i++) {
            label = <any>labels[i];
            this.children[label].addPrefixPnames(prefixPnames);
        }
    }

    findChildWithLabel(l: number) {
        return this.children[l];
    }

    toJSON() {
        var n: {
            prefix: string,
            children?: NodeChildren,
            maps?: MethodToHandlerMap;
            signature?: string;
        } = {
                prefix: this.prefix
            };

        var labels = Object.keys(this.children);
        if (labels.length > 0) {
            n.children = this.children;
        }

        var methods = Object.keys(this.handlerMap);
        if (methods.length > 0) {
            n.maps = this.handlerMap;
        }

        if (labels.length == 0 || methods.length > 0) {
            n.signature = this.signature;
        }
        return n;
    }
}

/**
 * merge two Nodes with same prefix
 * @param dest dest Node
 * @param source source Node
 */
function _merge(dest: Node, source: Node) {
    var labels: string[],
        label: number,
        i: number,
        len: number;

    Object.assign(dest.handlerMap, source.handlerMap);

    labels = Object.keys(source.children);
    for (i = 0, len = labels.length; i < len; i++) {
        label = <any>labels[i];

        if (dest.children[label]) {
            merge(dest.children[label], source.children[label]);
        } else {
            dest.addChild(source.children[label]);
        }
    }

    return dest;
}

/**
 * merge two Nodes with same label
 * @param dest dest Node
 * @param source source Node
 */
function merge(dest: Node, source: Node) {
    var labels: string[],
        label: number,
        i: number,
        len: number,
        dpl: number,
        spl: number,
        max: number,
        l: number,
        n: Node;

    source.parent = null;

    if (dest.prefix == source.prefix) {
        return _merge(dest, source);
    }

    dpl = dest.prefix.length;
    spl = source.prefix.length;
    l = 0;

    // LCP
    max = dpl;
    if (spl < max) {
        max = spl;
    }
    for (; l < max && dest.prefix.charCodeAt(l) == source.prefix.charCodeAt(l); l++) { }

    // l == dpl && dpl <= spl && l <= spl
    if (l == dpl) {
        n = new Node(source.kind, source.prefix.substring(l), source.children, source.handlerMap);
        if (dest.children[n.label]) {
            merge(dest.children[n.label], n);
        } else {
            dest.addChild(n);
        }
        return dest;
    }

    // l < dpl
    n = new Node(dest.kind, dest.prefix.substring(l), dest.children, dest.handlerMap);
    dest.reset(dest.kind, dest.prefix.substring(0, l));
    dest.addChild(n);

    // l < dpl && l == spl && dpl > spl
    if (l == spl) {
        return _merge(dest, source);
    }

    // l < dpl && l < spl
    n = new Node(source.kind, source.prefix.substring(l), source.children, source.handlerMap);
    dest.addChild(n);
    return dest;
}

export class PathHandlerMap {
    tree: Node;

    constructor() {
        this.tree = new Node();
    }

    /**
     * merge two Nodes, source Node must to start with "/"
     * @param dest dest Node
     * @param source source Node
     * @param prefixPnames prefix pnames
     */
    static merge(dest: Node, source: Node, prefixPnames?: string[]) {
        var l: number,
            n: Node;

        if (source.label != SLASH) {
            throw new Error('Source node must to start with "/"');
        }

        if (prefixPnames) {
            source.addPrefixPnames(prefixPnames);
        }

        if (dest.label == source.label) {
            return merge(dest, source);
        }

        l = dest.prefix.length - 1;
        if (dest.prefix.charCodeAt(l) == SLASH) {
            n = new Node(dest.kind, dest.prefix.substring(l), dest.children, dest.handlerMap);
            dest.reset(dest.kind, dest.prefix.substring(0, l));
            dest.addChild(n);
            return merge(n, source);
        }

        if (dest.children[SLASH]) {
            return merge(dest.children[SLASH], source);
        }

        dest.addChild(source);
        return dest;
    }

    /**
     * Add mapping between path expression and handler
     * @param method Method name
     * @param path Path Expression
     * @param handler Handler
     */
    add(path: string, method?: string, handler?: Function) {
        if (path.charCodeAt(0) != SLASH) {
            path = '/' + path;
        }

        var pnames: string[] = [], // Param names
            p = 0,
            pname: string,
            i: number,
            j: number,
            l: number,
            code: number;

        for (i = 0, l = path.length; i < l; i++) {
            code = path.charCodeAt(i);
            if (code == COLON) {
                j = i + 1;

                this.insert(path.substring(0, i), skind);

                for (; i < l && path.charCodeAt(i) != SLASH; i++) { }

                pname = path.substring(j, i);
                // unnamed param
                if (pname == '') {
                    pname = ':' + p;
                    p++;
                }

                if (pname.charCodeAt(pname.length - 1) != STAR) {
                    pnames.push(pname);

                    path = path.substring(0, j) + path.substring(i);
                    i = j;
                    l = path.length;

                    if (i == l) {
                        return this.insert(path, pkind, method, handler, pnames);
                    }

                    this.insert(path.substring(0, i), pkind);

                } else {
                    pname = pname.substring(0, pname.length - 1);
                    pnames.push(pname);
                    return this.insert(path.substring(0, j - 1) + '*', akind, method, handler, pnames);
                }

            } else if (code == STAR) {
                this.insert(path.substring(0, i), skind)
                pnames.push('*');
                return this.insert(path.substring(0, i + 1), akind, method, handler, pnames);
            }
        }

        return this.insert(path, skind, method, handler, pnames);
    }

    /**
     * Find Handler
     * @param method Method name
     * @param path Real path
     */
    find(method: string, path: string) {
        var r: FindResult = {
            found: false,
            handler: undefined,
            pnames: undefined,
            pvalues: []
        };
        this.recursiveFind(method, path, this.tree, 0, r);
        return r;
    }

    /**
     * Lookup the `Node` of path expression
     * @param path Path expression
     */
    lookup(path: string) {
        var cn = this.tree,
            search = path,
            sl: number,
            pl: number,
            max: number,
            l: number,
            i: number;

        while (true) {
            if (cn == undefined) {
                return null;
            }

            sl = search.length;
            pl = cn.prefix.length;
            l = 0;

            // LCP
            max = pl;
            if (sl < max) {
                max = sl;
            }
            for (; l < max && search.charCodeAt(l) == cn.prefix.charCodeAt(l); l++) { }

            if (l != pl) {
                return null;
            }

            if (cn.kind == skind) {
                search = search.substring(l);
                if (search.charCodeAt(0) == COLON) {
                    i = 0;
                    sl = search.length;
                    for (; i < sl && search.charCodeAt(i) != SLASH; i++) { }

                    if (search.charCodeAt(i - 1) != STAR) {
                        search = ':' + search.substring(i);
                    } else {
                        search = '*';
                    }
                }

            } else if (cn.kind == pkind) {
                search = search.substring(l);

            } else {
                search = '';
            }

            if (search == '') {
                return cn;
            }

            cn = cn.children[search.charCodeAt(0)];
        }
    }

    private insert(path: string, kind: Kind, method?: string, handler?: Function, pnames?: string[]) {
        var cn = this.tree,
            search = path,
            sl: number,
            pl: number,
            max: number,
            l: number,
            n: Node,
            c: Node;

        while (true) {
            sl = search.length;
            pl = cn.prefix.length;
            l = 0;

            // LCP
            max = pl;
            if (sl < max) {
                max = sl;
            }
            for (; l < max && search.charCodeAt(l) == cn.prefix.charCodeAt(l); l++) { }

            if (l < pl) {
                // There is some overlap between `search` and `cn.prefix`
                // Split node
                n = new Node(cn.kind, cn.prefix.substring(l), cn.children, cn.handlerMap);
                // Reset parent node
                cn.reset(skind, cn.prefix.substring(0, l));
                cn.addChild(n);

                // l < pl && l == sl
                if (l == sl) {
                    // `search` ⊆ `cn.prefix`
                    cn.kind = kind;
                    cn.addHandler(method, handler, pnames);
                    return cn;
                }

                // l < pl && l < sl
                // eg: search = '/page', cn.prefix = '/post'
                n = new Node(kind, search.substring(l));
                n.addHandler(method, handler, pnames);
                cn.addChild(n);
                return n;
            }

            // l == pl && l < sl
            if (l < sl) {
                // Match whole prefix, `cn.prefix` ⊆ `search`
                search = search.substring(l);

                c = cn.findChildWithLabel(search.charCodeAt(0));
                if (c != undefined) {
                    // Continue search child
                    cn = c;
                    continue;
                }

                // Create child node
                n = new Node(kind, search);
                n.addHandler(method, handler, pnames);
                cn.addChild(n);
                return n;
            }

            // l == pl && l == sl
            cn.addHandler(method, handler, pnames);
            return cn;
        }
    }

    private recursiveFind(method: string, path: string, cn: Node, n: number, r: FindResult) {
        var search = path,
            pvalues = r.pvalues,

            presearch: string, // Pre search

            c: Node, // Child node

            sl: number, // search length
            pl: number, // prefix length
            max: number,
            l: number,
            i: number,

            h: HandlerAndPnames;

        if (search == '' || search == cn.prefix) {
            h = cn.handlerMap[method];
            if (h != undefined) {
                r.found = true;
                r.handler = h.handler;
                r.pnames = h.pnames;
            }
            return;
        }

        sl = search.length;
        pl = cn.prefix.length;
        l = 0;

        // LCP
        max = pl;
        if (sl < max) {
            max = sl;
        }
        for (; l < max && search.charCodeAt(l) == cn.prefix.charCodeAt(l); l++) { }

        if (l == pl) {
            search = search.substring(l);
        }

        // Static node
        c = cn.children[search.charCodeAt(0)];
        if (c != undefined && c.kind == skind) {
            this.recursiveFind(method, search, c, n, r);
            if (r.found) {
                return;
            }
        }

        if (cn.kind != skind) {
            return;
        }

        // Param node
        c = cn.children[COLON];
        if (c != undefined) {
            i = 0;
            sl = search.length;
            for (; i < sl && search.charCodeAt(i) != SLASH; i++) { }
            pvalues[n] = search.substring(0, i);

            n++
            presearch = search;
            search = search.substring(i);

            this.recursiveFind(method, search, c, n, r);
            if (r.found) {
                return;
            }

            n--;
            search = presearch;
        }

        // Any node
        c = cn.children[STAR];
        if (c != undefined) {
            pvalues[n] = search;
            n = -1;
            search = '';
            this.recursiveFind(method, search, c, n, r);
        }
    }
}
