package main

import (
	"math"
	"math/rand"
)

type Point struct {
	X	int	`json:"x"`
	Y	int	`json:"y"`
}

type Points []Point

type Solver struct {
	Input  Points `json:"p"`
	Config []float64 `json:"config"`
}

type Solution []Points

type callback func(Solver) Solution


func (a Point) distance(b Point) float64 {
	return math.Sqrt( float64((a.X - b.X)*(a.X - b.X) + (a.Y - b.Y)*(a.Y - b.Y)) )
}

func (p Points) Len() float64 {
	total := 0.0
	for i := 0; i < len(p)-1; i += 1 {
		total += p[i].distance(p[i+1])
	}
	return total
}

func (p Points) Swap(i, j int) {
	p[i], p[j] = p[j], p[i]
}


// Shuffles a path in place
func (p Points) Shuffle() {
	for i := range p {
		j := rand.Intn(i + 1)
		p.Swap(i, j)
	}
}

// Returns a permutation of the path
func (p Points) Random() Points {
	p2 := make(Points, len(p))
	copy(p2, p)
	p2.Shuffle()
	return p2
}

// Return a neighbour of the path
func (p Points) Neighbour() Points {
	a, b := rand.Int() % len(p), rand.Int() % len(p)

	p2 := make(Points, len(p))
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
