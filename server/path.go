package main

import (
	"math"
	"math/rand"
	"time"
	//"log"
	"sort"
)

type Coord struct {
	X	int	`json:"x"`
	Y	int	`json:"y"`
}

type Path []Coord

type Solver struct {
	Input	Path `json:"p"`
	Config	[]float64 `json:"config"`
}

type Solution []Path

func (a Coord) distance(b Coord) float64 {
	return math.Sqrt( float64((a.X - b.X)*(a.X - b.X) + (a.Y - b.Y)*(a.Y - b.Y)) )
}

func (p Path) Len() float64 {
	total := 0.0
	for i := 0; i < len(p)-1; i += 1 {
		total += p[i].distance(p[i+1])
	}
	return total
}

func (p Path) Swap(i, j int) {
	p[i], p[j] = p[j], p[i]
}


// Shuffles a path in place
func (p Path) Shuffle() {
	for i := range p {
		j := rand.Intn(i + 1)
		p.Swap(i, j)
	}
}

// Returns a permutation of the path
func (p Path) Random() Path {
	p2 := make(Path, len(p))
	copy(p2, p)
	p2.Shuffle()
	return p2
}

// Return a neighbour of the path
func (p Path) Neighbour() Path {
	a, b := rand.Int() % len(p), rand.Int() % len(p)

	p2 := make(Path, len(p))
	copy(p2, p)

	p2[a], p2[b] = p2[b], p2[a]

	return p2
}


// Sorting solution
func (s Solution) Len() int {
	return len(s)
}

func (s Solution) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}

func (s Solution) Less(i, j int) bool {
	return s[i].Len() > s[j].Len();
}


// Solves TSP using Simulated Annealing
func (p Path) SimulatedAnnealing(cooling float64, iterations int) Solution {
	rand.Seed(time.Now().Unix())

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
		keep := make(Path, len(p))
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
func (p Path) LocalBeamSearch(k int, iterations int) Solution {
	rand.Seed(time.Now().Unix())

	var solution Solution

	// Bounds and default values
	if k < 1 || k > 200 {
		k = 200
	}

	if iterations < 1 || iterations > 3000 {
		iterations = 2000
	}

	best := make(chan Path)

	routine := func(pp Path) {

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
		keep := make(Path, len(p))
		copy(keep, <-best)
		solution = append(solution, keep)
	}

	sort.Sort(solution)

	return solution
}