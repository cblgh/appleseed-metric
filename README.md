# `appleseed-metric`
Appleseed is a trust propagation algorithm and trust metric for local group trust computation. It was first described by Cai-Nicolas Ziegler and Georg Lausen in [Propagation Models for Trust and Distrust in Social Networks](http://www2.informatik.uni-freiburg.de/~cziegler/papers/ISF-05-CR.pdf).

Basically, Appleseed makes it possible to take a group of nodes—which have various trust relations to each other—look at the group from the perspective of a single node, and rank each of the other nodes according to how trusted they are from the perspective of the single node. 

Appleseed is used by [TrustNet](https://github.com/cblgh/trustnet), a system for interacting with and managing computational trust.

For more details, see [Chapter 6 of the TrustNet report](https://cblgh.org/dl/trustnet-cblgh.pdf#section.6.1) by Alexander Cobleigh. The report contains a full walkthrough of the original algorithm's pseudocode, a legend over all of the variables, and water-based analogy for understanding the otherwise abstract algorithm (and illustrations!) You may also be interested in reading the [blog article](https://cblgh.org/articles/trustnet.html) introducing TrustNet.

## Usage
```javascript
const appleseed = require("appleseed-metric")
const trustAssignments = []
trustAssignments.push({ src: 'a', dst: 'b', weight: 0.80 })
trustAssignments.push({ src: 'a', dst: 'c', weight: 0.80 })
trustAssignments.push({ src: 'b', dst: 'd', weight: 0.80 })
trustAssignments.push({ src: 'x', dst: 'y', weight: 0.80 })
const source = "a"
appleseed(source, trustAssignments, 200, 0.85, 0.01).then((result) => {
    console.log(`converged in ${result.iteration} iterations`)
    console.log(result.rankings) // won't contain x or y, as they are unconnected to a. 
    // b, c, and d will have numerical rankings assigned to them
})
```

## API
```javascript
const appleseed = require("appleseed-metric")
```

### appleseed (source, trustAssignments, initialEnergy, spreadingFactor, threshold) 
Returns a promise. which resolves into a object of `id` -> `rank` mappings. The promise is resolved when the algorithm has converged, and all the trust ranks have been determined, as seen from the connected graph emanating outwards from `source`.

## Returns `{ rankings, graph, iterations }
* `rankings` Object mapping an identifier from a `src` or `dst` field in `trustAssignments` to its found trust ranking, which is a float.
* `graph` The trust graph, discovered by traversing `trustAssignments` from the starting point `source`
* `iterations` The number of iterations required before convergence. Normally around 50-70 iterations.

## Parameters
* `source` The trust source whose trust graph we are traversing to determine trust ranks.
* `trustAssignments` A list of trust assignments of form `[{ src, dst, weight}, ..]`. `src` and `dst` are strings, while `weight` is a float defined in the range `0.0` - `1.0`.
* `initialEnergy` The amount of energy the Appleseed distributes across the trust graph's discovered nodes. Ziegler & Lausen's recommended default is `200`.
* `spreadingCoefficient` Determines the amount of energy each node passes on to nodes it trusts (and correspondingly the amount of energy it gets to keep it self. Defined in the range `0.0` to `1.0`. Recommended default is `0.85`
* `threshold` Iteration has stopped, and convergence is reached, when `threshold` exceeds the largest change in energy in the past iteration.

## License
`appleseed-metric` is available for [dual-licensing](https://www.oreilly.com/library/view/open-source-for/0596101198/ch08s07.html). All the code in this repository is licensed as `AGPL3.0-or-later`. If AGPL3 does not work for you, or your organization, contact `cblgh-at-cblgh dotte org` to purchase a more permissive usage license. 

If your project is a not-for-profit project, the permissive license will likely be available at very low-cost :)
