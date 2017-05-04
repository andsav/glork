package main


import (
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"log"
)

type Note struct {
	Title	string		`json:"title"`
	URL	string		`json:"url"`
	Content	string		`json:"content"`
	Tags	[]string 	`json:"tags"`
}

type Notes []Note

func GetNotesList() Notes {
	var notes Notes

	session, err := mgo.Dial("localhost")
	if err != nil {
		log.Println("Database error: ", err)
		return notes
	}
	defer session.Close()

	session.SetMode(mgo.Monotonic, true)

	c := session.DB("notes").C("notes")

	err = c.Find(bson.M{}).All(&notes)
	if err != nil {
		log.Println("Database error: ", err)
		return notes
	}

	return notes
}