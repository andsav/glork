package main

import (
	"time"
	"github.com/gorilla/websocket"
)

type KMSolution struct {
	C	Points		`json:"c"`
	PP	[]Points	`json:"pp"`
}

type DBSCANSolution map[Point]int

const Noise = -1

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

func (s DBSCANSolution) Send(socket *websocket.Conn, final bool) bool {
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

	if final {
		ret = append(ret, Points{})
	}

	time.Sleep(25 * time.Millisecond)
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
			solution.Send(socket, false)

			for i := 0; i < len(neighbours); i++ {
				np := neighbours[i]
				if _, exists := solution[np]; exists {
					continue
				}

				solution[np] = c
				solution.Send(socket, false)

				npp := pp.Region(np, eps)
				if len(npp) >= min_points {
					neighbours = append(neighbours, npp...)
				}
			}

		}

	}


	solution.Send(socket, true)

}