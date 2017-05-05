package main

import "net/http"

type Route struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc http.HandlerFunc
}

type Routes []Route

var routes = Routes{
	Route{
		"Index",
		"GET",
		"/",
		Index,
	},
	Route{
		"TspSA",
		"POST",
		"/tsp/sa",
		TspSA,
	},
	Route{
		"TspLBS",
		"POST",
		"/tsp/lbs",
		TspLBS,
	},
	Route{
		"ClusteringKMeans",
		"GET",
		"/clustering/kmeans",
		ClusteringKMeans,
	},
	Route{
		"ClusteringDBSCAN",
		"GET",
		"/clustering/dbscan",
		ClusteringDBSCAN,
	},
	Route{
		"NotesList",
		"GET",
		"/notes/list",
		NotesList,
	},
	Route{
		"NotesSingle",
		"GET",
		"/note/{url}",
		NotesSingle,
	},
	Route{
		"NotesRandom",
		"GET",
		"/notes/random",
		NotesRandom,
	},
}