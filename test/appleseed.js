const test = require("tape")
const appleseed = require("../")

test("instantiation should work", (t) => {
    const trust = []
    const source = "a"
    trust.push({ src: 'a', dst: 'b', weight: 0.80 })
    trust.push({ src: 'a', dst: 'c', weight: 0.80 })
    trust.push({ src: 'b', dst: 'd', weight: 0.80 })
    trust.push({ src: 'x', dst: 'y', weight: 0.80 })
    appleseed(source, trust, 200, 0.85, 0.01).then((result) => {
        const rankings = result.rankings
        t.assert(rankings["b"], "node b exists in rankings")
        t.assert(rankings["c"], "node c exists in rankings")
        t.assert(rankings["d"], "node d exists in rankings")
        t.false("x" in rankings, "node x should not be in rankings")
        t.false("y" in rankings, "node y should not be in rankings")
        t.end()
    })
})
