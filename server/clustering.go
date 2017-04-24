package main

import (
	"time"
	"github.com/gorilla/websocket"
	"log"
)

type KMSolution struct {
	C	Points		`json:"c"`
	PP	[]Points	`json:"pp"`
}

type DBSCANSolution map[Point]int

func (s *KMSolution) AssignPoints(pp Points) {
	s.PP = make([]Points, len(s.C))

	for _, p := range pp {
		minD, minI := 1000.0, 0
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

func (s *KMSolution) AssignCentroids(r Rectangle) {
	s.C = make(Points, len(s.PP))

	for i, pp := range s.PP {
		var c Point

		if len(pp) == 0 {
			c = r.RandomPoint()
		} else {
			c = pp.Centroid()
		}

		s.C[i] = c
	}
}

func (s DBSCANSolution) Send(socket *websocket.Conn) bool {
	reverse := make(map[int]Points)

	for p, cluster := range s {
		if _, exists := reverse[cluster]; !exists {
			reverse[cluster] = make(Points, 0, len(s))
		}

		reverse[cluster] = append(reverse[cluster], p)
	}

	log.Print(reverse)

	ret := make([]Points, 0, len(reverse))

	for _, pp := range reverse {
		ret = append(ret, pp)
	}

	return Send(ret, socket)
}

func (pp Points) KMeans(k int, socket *websocket.Conn) {
	var solution KMSolution

	if k < 2 || k > 10 {
		k = 2
	}

	solution.C = make([]Point, k)

	// Active area
	r := Rectangle{X0: 1000, X1: 0, Y0: 1000, Y1: 0}
	for _, p := range pp {
		if p.X < r.X0 {
			r.X0 = p.X
		} else if p.X > r.X1 {
			r.X1 = p.X
		}

		if p.Y < r.Y0 {
			r.Y0 = p.Y
		} else if p.Y > r.Y1 {
			r.Y1 = p.Y
		}
	}

	for i := 0; i < k; i++ {
		solution.C[i] = r.RandomPoint()
	}

	for i := 0; i < 100; i++ {
		keep := make(Points, k)
		copy(keep, solution.C)

		solution.AssignPoints(pp)

		if Send(solution, socket) == false {
			break
		}

		solution.AssignCentroids(r)

		if keep.eq(Points(solution.C)) {
			break
		}

		time.Sleep(100 * time.Millisecond)
	}
}

func (pp Points) Region(origin Point, eps float64) Points {
	var ret Points

	for _, p := range pp {
		if origin.distance(p) <= eps {
			ret = append(ret, p)
		}
	}

	return ret
}

func (pp Points) DBSCAN(eps float64, min_points int, socket *websocket.Conn) {
	solution := make(DBSCANSolution)

	/*
	@todo
	for _, p := range pp {
		solution[p] = random_int(0, 5)
	}

	log.Print(solution)

	*/

	solution.Send(socket)
}