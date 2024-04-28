import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { nanoid } from "nanoid"
//listen for changes in Firestore DB and act accordingly on local code(storage)
//function from Firebase
import { onSnapshot, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore"
import { notesCollection, db } from "./firebase"

export default function App() {
    const [notes, setNotes] = React.useState([])
    const [currentNoteId, setCurrentNoteId] = React.useState("")
    const [tempNoteText, setTempNoteText] = React.useState("")

    const currentNote =
        notes.find(note => note.id === currentNoteId)
        || notes[0]

   const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt)

    React.useEffect(() => {
        // Websocket connection with our DB by setting up onSnapshot listener
        // loads once and then listening for changes
        // On Snapshot returns a function that we can save, it unsubscribes from the listener "unsubscribe"
        const unsubscribe = onSnapshot(notesCollection, function(snapshot) {
            // call back function called whenever there is a change to the notes collection
            // get most updated version of data from db from the "snapshot"
            // Sync up our local notes array with snapshot data
            const notesArr = snapshot.docs.map(doc => ({
                // return object that has all of the data from the doc
                ...doc.data(),
                // firestore does not put the id as part of the data of the document, the document has it's own id property
                id: doc.id
            }))
            setNotes(notesArr)
        })
        // Give React a way to unsubscribe from this listener if the connection is unmounted, to avoid memory leaks
        // Clean up side effects
        // unsubscribe from listener
        // a callback function that will clean up any side effects happening from inside use effect
        return unsubscribe
        // No dependencies, set up once
    }, [])

    React.useEffect(() => {
        if (!currentNoteId) {
            setCurrentNoteId(notes[0]?.id)
        }
    }, [notes])

    React.useEffect(() => {
        if (currentNote) {
            setTempNoteText(currentNote.body)
        }
    }, [currentNote])

    //  Create an effect that runs any time the tempNoteText changes
    //  Delay the sending of the request to Firebase using setTimeout()
    //  Use clearTimeout to cancel the timeyout

    React.useEffect(() => {
        //timeoutId gets returned when you call setTimeout
        const timeoutId = setTimeout(() => {
            if (tempNoteText !== currentNote.body) {
                updateNote(tempNoteText)
            }
        }, 500)
        //use timeoutId to clear the timeout
        //called each time this useEffect is about to run again, clean up from previous call
        //will cancel the UseEffect callback function if within 500 ms.
        return () => clearTimeout(timeoutId)
    }, [tempNoteText])

    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        const newNoteRef = await addDoc(notesCollection, newNote)
        setCurrentNoteId(newNoteRef.id)
    }

    async function updateNote(text) {
        const docRef = doc(db, "notes", currentNoteId)
        // by default completely overwrites the existing document with object provided { body: text }
        // merge this object into the existing document instead of complete overwrite
        await setDoc(
            docRef,
            { body: text, updatedAt: Date.now()},
            { merge : true })
    }

    async function deleteNote(noteId) {
        const docRef = doc(db, "notes", noteId)
        await deleteDoc(docRef)
    }

    return (
        <main>
            {
                notes.length > 0
                    ?
                    <Split
                        sizes={[30, 70]}
                        direction="horizontal"
                        className="split"
                    >
                        <Sidebar
                            notes={sortedNotes}
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                            <Editor
                                tempNoteText={tempNoteText}
                                setTempNoteText={setTempNoteText}
                                // currentNote={currentNote}
                                // updateNote={updateNote}
                            />
                    </Split>
                    :
                    <div className="no-notes">
                        <h1>You have no notes</h1>
                        <button
                            className="first-note"
                            onClick={createNewNote}
                        >
                            Create one now
                </button>
                    </div>

            }
        </main>
    )
}
