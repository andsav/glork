package main

import (
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"log"
	"crypto/sha256"
	"encoding/hex"
	"time"
)

type Query interface {
	All(result interface{}) error
	One(result interface{}) error
}

type GetQueryCallback func(*mgo.Collection) (Query, bool)
type ChangeQueryCallback func(*mgo.Collection) bool

type Note struct {
	Id    		bson.ObjectId	`json:"id" bson:"_id,omitempty"`
	Title   	string		`json:"title"`
	URL     	string  	`json:"url"`
	Content 	string   	`json:"content"`
	Modified	time.Time	`json:"modified,omitempty" bson:",omitempty"`
	Tags    	[]string        `json:"tags"`
	Tree	   	[]string		    `json:"tree"`
}

type NoteData struct {
	N		Note		`json:"note"`
	Password	string		`json:"password"`
}

type Notes []Note

type Tag struct {
	Id    		string		`json:"id" bson:"_id"`
	Count 		int		`json:"count"`
}

type Tags []Tag

func GetAllNotes() Notes {
	var notes Notes

	get(func(c *mgo.Collection) (Query, bool) {
		return c.Find(bson.M{}).Select(bson.M{ "title":  1, "url": 1, "tree": 1 }).Sort("-_id"), true
	}, &notes)

	return notes
}

func GetNotesByTag(tag string) Notes {
	var notes Notes

	get(func(c *mgo.Collection) (Query, bool) {
		return c.Find(bson.M{ "tags":  tag }).Select(bson.M{ "title":  1, "url": 1 }).Sort("-_id"), true
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

func CheckPassword(password string, session *mgo.Session) bool {
	h := sha256.New()
	h.Write([]byte(password))
	hash := hex.EncodeToString(h.Sum(nil))

	c := session.DB("notes").C("password")
	count, err := c.Find(bson.M{"password": hash}).Count()

	return err == nil && count != 0
}

func (n Note) Update(id string, password string) bool {
	n.Modified = time.Now()
	return change(func(c *mgo.Collection) bool {
		return c.Update(bson.M{"url": id}, n) == nil
	}, password);
}

func (n Note) Add(password string) bool {
	return change(func(c *mgo.Collection) bool {
		return c.Insert(n) == nil
	}, password);
}

func DeleteNote(id string, password string) bool {
	return change(func(c *mgo.Collection) bool {
		return c.Remove(bson.M{"url": id}) == nil
	}, password);
}

func change(cb ChangeQueryCallback, password string) bool {
	session, err := mgo.Dial("localhost")
	if err != nil {
		log.Println("Database error: ", err)
		return false;
	}
	defer session.Close()
	session.SetMode(mgo.Monotonic, true)

	if !CheckPassword(password, session) {
		log.Println("Wrong password ", password)
		return false;
	}

	c := session.DB("notes").C("notes")
	return cb(c)
}

func get(cb GetQueryCallback, result interface{}) {
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