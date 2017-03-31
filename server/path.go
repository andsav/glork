package main

import (
	"math"
	"math/rand"
	"time"
	//"log"
)

type Coord struct {
	X	int	`json:"x"`
	Y	int	`json:"y"`
}

type Path []Coord

type Solution []Path

func (a Coord) distance(b Coord) float64 {
	return math.Sqrt( float64((a.X - b.X)*(a.X - b.X) + (a.Y - b.Y)*(a.Y - b.Y)) )
}


func (p Path) length() float64 {
	total := 0.0
	for i := 0; i < len(p)-1; i += 1 {
		total += p[i].distance(p[i+1])
	}
	return total
}

// Shuffles a path in place
func (p Path) shuffle() {
	for i := range p {
		j := rand.Intn(i + 1)
		p[i], p[j] = p[j], p[i]
	}
}

// Return a neighbour of the path
func (p Path) neighbour() Path {
	a, b := rand.Int() % len(p), rand.Int() % len(p)

	p2 := make(Path, len(p))
	copy(p2, p)

	p2[a], p2[b] = p2[b], p2[a]

	return p2
}

// Solves TSP using Simulated Annealing
func (p Path) SA() Solution {
	rand.Seed(time.Now().Unix())

	var solution Solution
	p.shuffle()

	//log.Printf("%s", p)

	ap := func(last float64, current float64, t float64) float64 {
		return math.Exp((last-current)/t)
	}

	for t := 1.0; t > 0.000001; t *= 0.98 {
		keep := make(Path, len(p))
		copy(keep, p)
		solution = append(solution, keep)

		for i := 0; i < 100; i += 1 {
			p2 := p.neighbour();
			if(ap(p.length(), p2.length(), t) > rand.Float64()) {
				copy(p, p2);
			}
		}
	}

	return solution
}
