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


type Rectangle struct {
	X0	int
	X1	int
	Y0	int
	Y1	int
}

func random_int(min, max int) int {
	return rand.Intn(max - min) + min
}

func (r Rectangle) RandomPoint() Point {
	return Point{
		X: random_int(r.X0, r.X1),
		Y: random_int(r.Y0, r.Y1),
	};
}

func (a Point) distance(b Point) float64 {
	return math.Sqrt( float64((a.X - b.X)*(a.X - b.X) + (a.Y - b.Y)*(a.Y - b.Y)) )
}

func (pp Points) Len() float64 {
	total := 0.0
	for i := 0; i < len(pp)-1; i += 1 {
		total += pp[i].distance(pp[i+1])
	}
	return total
}

func (pp Points) Swap(i, j int) {
	pp[i], pp[j] = pp[j], pp[i]
}


// Shuffles a path in place
func (pp Points) Shuffle() {
	for i := range pp {
		j := rand.Intn(i + 1)
		pp.Swap(i, j)
	}
}

// Returns a permutation of the path
func (pp Points) Random() Points {
	pp2 := make(Points, len(pp))
	copy(pp2, pp)
	pp2.Shuffle()
	return pp2
}

// Return a neighbour of the path
func (pp Points) Neighbour() Points {
	a, b := rand.Int() % len(pp), rand.Int() % len(pp)

	pp2 := make(Points, len(pp))
	copy(pp2, pp)

	pp2[a], pp2[b] = pp2[b], pp2[a]

	return pp2
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
