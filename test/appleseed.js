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
        t.false("a" in rankings, "source should not be in rankings")
        t.false("x" in rankings, "node x should not be in rankings")
        t.false("y" in rankings, "node y should not be in rankings")
        t.end()
    })
})

test("simple one hop, same weights", (t) => {
    const trust = []
    const source = "a"
    trust.push({ src: 'a', dst: 'b', weight: 0.80 })
    trust.push({ src: 'b', dst: 'c', weight: 0.80 })
    trust.push({ src: 'b', dst: 'd', weight: 0.80 })
    appleseed(source, trust, 200, 0.85, 0.01).then((result) => {
        const rankings = result.rankings
        const rankB = rankings.b
        t.assert(rankB, "node b exists in rankings")
        t.assert(rankB > rankings.c, "node b is higher than c")
        t.assert(rankB > rankings.d, "node b is higher than d")
        t.end()
    })
})

test("simple one hop, lower weight", (t) => {
    const trust = []
    const source = 'a'
    trust.push({ src: 'a', dst: 'b', weight: 0.80 })
    trust.push({ src: 'b', dst: 'c', weight: 0.80 })
    trust.push({ src: 'b', dst: 'd', weight: 0.40 }) // lower
    appleseed(source, trust, 200, 0.85, 0.01).then((result) => {
        const rankings = result.rankings
        const rankB = rankings.b
        t.assert(rankB, "node b exists in rankings")
        t.assert(rankB > rankings.c, "node b has more energy than c")
        t.assert(rankB > rankings.d, "node b has more energy than d")
        t.assert(rankings.c > rankings.d, "node c has more energy than d")
        t.end()
    })
})

test("two trustees", (t) => {
    const trust = []
    const source = 'a'
    // a trusts b and c
    trust.push({ src: 'a', dst: 'b', weight: 0.80 })
    trust.push({ src: 'a', dst: 'c', weight: 0.80 })

    // b trusts d and e
    trust.push({ src: 'b', dst: 'd', weight: 0.80 })
    trust.push({ src: 'b', dst: 'e', weight: 0.80 })

    // c also trusts d
    trust.push({ src: 'c', dst: 'd', weight: 0.80 })
    appleseed(source, trust, 200, 0.85, 0.01).then((result) => {
        const rankings = result.rankings
        t.assert(rankings.d > rankings.e, "node d has more energy than e")
        t.end()
    })
})
