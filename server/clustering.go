package main

import (
	"time"
	"encoding/json"
	"log"
	"github.com/gorilla/websocket"
)

type KMSolution struct {
	C	Points		`json:"c"`
	PP	[]Points	`json:"pp"`
}

func (s KMSolution) Print(socket *websocket.Conn) {
	ret, err := json.Marshal( s )
	if err == nil {
		err := socket.WriteMessage(websocket.TextMessage, ret)
		if err != nil {
			log.Println("[Socket] write err:", err)
		}
	}
}

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

func (pp Points) KMeans(k int, socket *websocket.Conn) {
	var solution KMSolution

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

	for i := 0; i < 21; i++ {
		keep := make(Points, k)
		copy(keep, solution.C)

		solution.AssignPoints(pp)
		solution.Print(socket)

		solution.AssignCentroids(r)

		if keep.eq(Points(solution.C)) {
			break;
		}

		time.Sleep(100 * time.Millisecond)
	}


}