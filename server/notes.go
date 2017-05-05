package main

import (
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"log"
)

type Query interface {
	All(result interface{}) error
	One(result interface{}) error
}

type GetQuery func(*mgo.Collection) (Query, bool)

type Note struct {
	Title   string		`json:"title"`
	URL     string  	`json:"url"`
	Content string   	`json:"content"`
	Tags    []string        `json:"tags"`
}

type Notes []Note

type Tag struct {
	Id    	string		`json:"_id" bson:"_id"`
	Count 	int		`json:"count"`
}

type Tags []Tag

func GetAllNotes() Notes {
	var notes Notes

	get(func(c *mgo.Collection) (Query, bool) {
		return c.Find(bson.M{}).Sort("-$natural"), true
	}, &notes)

	return notes
}

func GetNotesByTag(tag string) Notes {
	var notes Notes

	get(func(c *mgo.Collection) (Query, bool) {
		return c.Find(bson.M{ "tags":  tag }).Sort("-$natural"), true
	}, &notes)

	return notes
}

func GetSingleNote(url string) Note {
	var note Note

	get(func(c *mgo.Collection) (Query, bool) {
		return c.Find(bson.M{"url": url}), false
	}, &note)

	return note
}

func GetRandomNote() Note {
	var note Note

	get(func(c *mgo.Collection) (Query, bool) {
		return c.Pipe([]bson.M{{"$sample": bson.M{"size" : 1 } } }), false
	}, &note)

	return note
}

func GetAllTags() Tags {
	var tags Tags

	get(func(c *mgo.Collection) (Query, bool) {
		return c.Pipe([]bson.M{
			{"$unwind": "$tags" },
			{"$project": bson.M{"tags": 1 } },
			{"$group": bson.M{
				"_id": "$tags",
				"count": bson.M{"$sum": 1 } } },
			{"$sort": bson.M{"count" : -1 } } }), true
	}, &tags)

	return tags
}

func get(cb GetQuery, result interface{}) {
	session, err := mgo.Dial("localhost")
	if err != nil {
		log.Println("Database error: ", err)
		return;
	}
	defer session.Close()

	session.SetMode(mgo.Monotonic, true)
	c := session.DB("notes").C("notes")

	q, multi := cb(c)

	if (multi) {
		err = q.All(result)
	} else {
		err = q.One(result)
	}

	if err != nil {
		log.Println("Database error: ", err)
		return;
	}
}