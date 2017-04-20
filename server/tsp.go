package main

import (
	"math"
	"math/rand"
	"sort"
)


// Solves TSP using Simulated Annealing
func (p Points) SimulatedAnnealing(cooling float64, iterations int) Solution {
	var solution Solution
	p.Shuffle()

	// Bounds and default values
	if cooling < 0.85 || cooling > 0.99 {
		cooling = 0.98
	}

	if iterations < 1 || iterations < 500 {
		iterations = 200
	}

	ap := func(last float64, current float64, t float64) float64 {
		return math.Exp(((last-current)/10000)/t)
	}

	for t := 1.0; t > 0.00001; t *= cooling {
		keep := make(Points, len(p))
		copy(keep, p)
		solution = append(solution, keep)

		for i := 0; i < iterations; i += 1 {
			p2 := p.Neighbour()
			if ap(p.Len(), p2.Len(), t) > rand.Float64() {
				copy(p, p2)
			}
		}
	}

	return solution
}

// Solves TSP using Local Beam Search
func (p Points) LocalBeamSearch(k int, iterations int) Solution {
	var solution Solution

	// Bounds and default values
	if k < 1 || k > 200 {
		k = 200
	}

	if iterations < 1 || iterations > 3000 {
		iterations = 2000
	}

	best := make(chan Points)

	routine := func(pp Points) {

		for i := 0; i < iterations; i += 1 {
			pp2 := pp.Neighbour()
			if pp2.Len() < pp.Len() {
				copy(pp, pp2)
			}
		}

		best <- pp
	}

	for i := 0; i < k; i++ {
		go routine(p.Random())
	}

	for i := 0; i < k; i++ {
		keep := make(Points, len(p))
		copy(keep, <-best)
		solution = append(solution, keep)
	}

	sort.Sort(solution)

	return solution
}