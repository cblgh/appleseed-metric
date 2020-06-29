var util = require("./util.js")
var Graph = require("trustnet-graph")
var debug = require("debug")("appleseed")

function createGraph (assignments) {
    return Graph(assignments)
}

async function trust (source, trustAssignments, initialEnergy, spreadingFactor, threshold) {
    debug("source %s", source)
    debug("initial energy %s", initialEnergy)
    debug("spreading factor %s", spreadingFactor)
    debug("activation threshold %s", threshold)
    debug("assignments %O", trustAssignments)
    const graph = createGraph(trustAssignments)
    const realSpreadingFactor = spreadingFactor
    // setup trust graph. PREV, CURR are syntactic sugar, leftovers from my first implementation
    const PREV = 0
    const CURR = 1
    const trust = [{}, {}]
    const incoming = [{}, {}]
    const nodes = [new Set(), new Set()]

    /* debug functions */
    // const debugIncoming = (node) => { util.debug(node, incoming, "INCOMING")  }
    // const debugTrust = (node) => { util.debug(node, trust, "TRUST") }
    // const debugNodes = (x) => { util.debug(x, nodes, "NODES") }
    
    // initialize state
    let i = 0
    incoming[PREV][source] = initialEnergy
    trust[PREV][source] = 0
    nodes[PREV].add(source)

    // start appleseed algorithm. 
    // the algorithm convergences in less than 100 iterations, but is bounded by 1000 iterations in this implementation. => it should be safe to just write: while (true), but untested atm
    while (i < 1000) {
        debug("iteration %s", i)
        i += 1
        nodes[CURR] = new Set(nodes[PREV]) // make a safe copy of the set
        // clear state for new iteration
        incoming[CURR] = util.initialiseObject(nodes[PREV], 0)
        for (let node of nodes[PREV]) {
            debug("current node: %s", node.slice(0,3))
            // source shall not pool up trust & it shall distribute *all* incoming trust
            const spreadingFactor = (node === source ? 1 : realSpreadingFactor)
            // give `node` a portion of the incoming trust
            const reservedTrust = (1 - spreadingFactor) * incoming[PREV][node]
            trust[CURR][node] = trust[PREV][node] + reservedTrust
            debug("previous_trust[%s] = %s", node.slice(0,3), trust[PREV][node])
            debug("current_trust[%s] = %s", node.slice(0,3), trust[CURR][node])
            for (edgePair of graph.outEdges(node)) {
                const dst = edgePair.dst
                // we have a new node, add it
                if (!nodes[CURR].has(dst)) {
                    // initialize new node
                    nodes[CURR].add(dst)
                    trust[CURR][dst] = 0
                    incoming[CURR][dst] = 0
                    // add back-propagating edge
                    graph.addEdge({ src: dst, dst: source, weight: 1.0 })
                }
                const outEdges = graph.outEdges(node)
                const totalWeight = outEdges.reduce((acc, e) => { return acc + parseFloat(e.weight) }, /* initial val = 0 */ 0)
                const dstWeight = parseFloat(edgePair.weight)
                const weightedIncoming = incoming[PREV][node] * (dstWeight / totalWeight)
                incoming[CURR][dst] += weightedIncoming * spreadingFactor
            }
        }
        if (i > 1) {
            let maxDelta = 0
            for (let y of nodes[CURR]) {
                // check if anyone in the trust graph has changed significantly this iteration
                const currMax = y in trust[CURR] ? trust[CURR][y] : 0
                const prevMax = y in trust[PREV] ? trust[PREV][y] : 0
                const delta = currMax - prevMax
                if (delta > maxDelta) { maxDelta = delta }
            }
            // if nobody changed significantly, terminate iteration
            if (maxDelta <= threshold) {
                debug(`convergence took ${i} iterations`)
                break
            }
        }
        // prepare for next iteration:
        // the current nodes are now the next iteration's previous nodes
        trust[PREV] = util.dupe(trust[CURR]) // ez mode safe obj copy
        incoming[PREV] = util.dupe(incoming[CURR])
        nodes[PREV] = new Set(nodes[CURR])
    }
    const rankings = util.dupe(trust[CURR])
    delete rankings[source] // source will by definition always be 0; it is unnecessary
    return { rankings, graph, iterations: i }
}

module.exports = trust
