import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"
import { Box, Grid, InputBase, IconButton, TextField } from "@material-ui/core"
import Button from '@material-ui/core/Button';
import { Add as AddIcon, Send as SendIcon } from "@material-ui/icons"
import "./popup.css"
import { getDatabase, getPages, addItem, updateItem } from "../utils/api"
import { getDateString } from "../utils/helpers"

const App: React.FC<{}> = () => {
	const [noteInput, setNoteInput] = useState<string>("")
	const [title, setTitle] = useState<string>("")
	const [link, setLink] = useState<string>("")
	const [difficulty, setDifficulty] = useState<string>("")
	const [practiced, setPracticed] = useState<boolean>(false)
	const [practiceTimes, setPracticeTimes] = useState<number>(0)
	const [pageID, setPageID] = useState<string>("")

	useEffect(() => {
		// try to get page from database
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			chrome.tabs.sendMessage(
				tabs[0].id,
				"ask for lc title from pop",
				(problemData) => {
					console.log("problemData=", problemData)
					setTitle(problemData[0])
					setLink(problemData[1])
					setDifficulty(problemData[2])
					getPages(problemData[0]).then((pages) => {
						console.log("pages=", pages)
						if (pages.length > 0) {
							setPracticed(true)
							const page = pages[0].properties
							setNoteInput(page.Notes.rich_text[0].plain_text)
							setPracticeTimes(page["Practice Times"].number)
							setPageID(pages[0].id)
						}
					})
				}
			)
		})
	}, [])

	const createNewItem = () => {
		let data = [noteInput, getDateString()]
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			chrome.tabs.sendMessage(
				tabs[0].id,
				"ask for lc title from pop",
				(problemData) => {
					// console.log("problemData=", problemData)
					data = [...problemData, ...data]
					console.log(data)
					addItem(data)
				}
			)
		})
	}

	const modifyItem = () => {
		let data = [noteInput, getDateString(), pageID, practiceTimes]
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			chrome.tabs.sendMessage(
				tabs[0].id,
				"ask for lc title from pop",
				() => {
					updateItem(data)
				}
			)
		})
	}

	const handleButtonClick = () => {

		if (!practiced) {
			createNewItem()
		} else {
			// update
			modifyItem()
		}

	}

	return (
		<Box
			mx="20px"
			my="50px"
		>
			<h1>{title}</h1>
			<div>{difficulty}</div>
			{practiced && <div>Practice Times: {practiceTimes}</div>}
			<TextField
				style={{ width: 270 }}
				placeholder="Add notes ..."
				multiline={true}
				value={noteInput}
				onChange={(event) => setNoteInput(event.target.value)}
			/>
			<br />
			{practiced ? <Button variant="outlined">Change</Button> :
				<Button variant="outlined">Add</Button>}
		</Box>
	)
}

const root = document.createElement("div")
document.body.appendChild(root)
ReactDOM.render(<App />, root)
