package main

import (
	"math"
	"time"
	"github.com/gorilla/websocket"
)

/*
 *	K-Means
 */

type KMSolution struct {
	C	Points		`json:"c"`
	PP	[]Points	`json:"pp"`
}

// K-means performs better if initial centroids are spread out
// The first centroid is assigned at random and subsequent centroids are the farthest apart from all the previous
func (s *KMSolution) InitializeCentroids(k int, pp Points) {
	s.C = make(Points, k)

	s.C[0] = pp.RandomPoint()

	for i := 1; i < k; i++ {

		maxD, bestP := 0.0, pp[0]
		for _, p := range pp {
			d := 0.0
			for j := 0; j < i; j++ {
				d += p.distance(s.C[j])
			}
			if maxD < d {
				maxD = d
				bestP = p
			}
		}

		s.C[i] = bestP
	}
}

// Group points by assigning them to the centroid that is nearest to them
func (s *KMSolution) AssignPoints(pp Points) {
	s.PP = make([]Points, len(s.C))

	for _, p := range pp {
		minD, minI := math.Inf(1), 0
		for i, c := range s.C {
			d := c.distance(p)
			if(d < minD) {
				minD = d
				minI = i
			}
		}

		s.PP[minI] = append(s.PP[minI], p)
	}
}

// Re-calculate the centroid for each group of points
func (s *KMSolution) AssignCentroids(pp Points) {
	s.C = make(Points, len(s.PP))

	for i, spp := range s.PP {
		var c Point

		if len(spp) == 0 {
			c = pp.RandomPoint()
		} else {
			c = spp.Centroid()
		}

		s.C[i] = c
	}
}

// Send solution through socket
func (s KMSolution) Send(socket *websocket.Conn) bool {
	time.Sleep(50 * time.Millisecond)
	return Send(s, socket)
}

func (pp Points) KMeans(k int, socket *websocket.Conn) bool {
	var solution KMSolution

	if k < 2 || k > 10 {
		k = 2
	}

	solution.InitializeCentroids(k, pp)

	for i := 0; i < 100; i++ {
		keep := make(Points, k)
		copy(keep, solution.C)

		solution.AssignPoints(pp)

		if solution.Send(socket) == false {
			break
		}

		solution.AssignCentroids(pp)

		if keep.eq(Points(solution.C)) {
			break
		}
	}

	socket.Close()
	return false
}

/*
 *	DBSCAN
 */

type DBSCANSolution map[Point]int

const Noise = -1

// Convert solution to desired format and send through socket
func (s DBSCANSolution) Send(socket *websocket.Conn) bool {
	reverse := make(map[int]Points)

	for p, cluster := range s {
		if cluster == Noise {
			continue
		}

		if _, exists := reverse[cluster]; !exists {
			reverse[cluster] = make(Points, 0, len(s))
		}

		reverse[cluster] = append(reverse[cluster], p)
	}

	ret := make([]Points, 0, len(reverse))

	for _, pp := range reverse {
		ret = append(ret, pp)
	}

	time.Sleep(25 * time.Millisecond)
	return Send(ret, socket)
}


func (pp Points) DBSCAN(eps float64, min_points int, socket *websocket.Conn) bool {
	solution, c := make(DBSCANSolution), 0

	for _, p := range pp {
		if _, exists := solution[p]; exists {
			continue
		}

		neighbours := pp.Region(p, eps)

		if len(neighbours) < min_points {
			solution[p] = Noise
		} else {
			c++
			solution[p] = c
			solution.Send(socket)

			for i := 0; i < len(neighbours); i++ {
				np := neighbours[i]
				if _, exists := solution[np]; exists {
					continue
				}

				solution[np] = c
				solution.Send(socket)

				npp := pp.Region(np, eps)
				if len(npp) >= min_points {
					neighbours = append(neighbours, npp...)
				}
			}

		}

	}

	solution.Send(socket)
	socket.Close()
	return false

}