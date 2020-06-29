function Graph (edges) {
    if (!(this instanceof Graph)) return new Graph(edges)
    // the graph data structure is as follows:
    // graph[node] = {
    //  inc: {} => inc[incomingNode] = {src, dst, weight},
    //  out: {} => out[outgoingNode] = {src, dst, weight}
    //  }
    this.graph = {}
    // edges were passed in
    if (edges && typeof edges[Symbol.iterator] === "function") { 
        edges.forEach(this.addEdge, this) 
    }
}

Graph.prototype.outEdges = function (node) {
    if (!this.graph.hasOwnProperty(node)) return []
    return Object.values(this.graph[node].out)
}

Graph.prototype.inEdges = function (node) {
    if (!this.graph.hasOwnProperty(node)) return []
    return Object.values(this.graph[node].inc)
}

Graph.prototype.exists = function (node) {
    return this.graph.hasOwnProperty(node)
}

Graph.prototype._initialiseNode = function (node) {
    this.graph[node] = { 
        inc: {},
        out: {}
    }
}

Graph.prototype._addOutgoing = function (e) {
    this.graph[e.src].out[e.dst] = e
}

Graph.prototype._addIncoming = function (e) {
    this.graph[e.dst].inc[e.src] = e
}

Graph.prototype.addEdge = function (e) {
    // edge: { src, dst, weight }
    // the edge source node was encountered for the first time
    if (!this.graph.hasOwnProperty(e.src)) { this._initialiseNode(e.src) }
    // the edge destination node was encountered for the first time
    if (!this.graph.hasOwnProperty(e.dst)) { this._initialiseNode(e.dst) }
    this._addOutgoing(e)
    this._addIncoming(e)
}

/* traverse graph in a breadth first search starting at `root` and looking for `node` */
Graph.prototype._traverse = function (root, node) {
    if (root === node) return 0
    // nodes to process at the current depth
    let queue = [root]
    // nodes at the next layer of depth
    let layer = []
    // node's we've visited
    let traversed = []
    let depth = 1
    // for each outgoing edge, check if any of the edges is the sought node
    while (queue.length > 0) {
        let current = queue.splice(0, 1)[0]
        traversed.push(current)
        let outgoing = this.outEdges(current).map((e) => e.dst)
        for (let n of outgoing) {
            if (n === node) { return depth }
            if (!traversed.includes(n)) { layer.push(n) }
        }
        // start new queue for next layer of nodes, which are at depth + 1
        if (queue.length === 0) { 
            queue = layer.slice() 
            layer = []
            depth = depth + 1
        }
    }
    // couldn't find node
    return -1
}

/* get depth of `node`, where `root` has depth 0. returns -1 if not found or not connected. */
Graph.prototype.getDepth = function (root, node) {
    if (!root || !node) { return -1 }
    if (!this.graph.hasOwnProperty(node)) { return -1 }
    return this._traverse(root, node)
}

Graph.prototype.nodes = function () {
    return Object.keys(this.graph)
}

module.exports = Graph
