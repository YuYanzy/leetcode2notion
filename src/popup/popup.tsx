import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"
import { Box, Grid, InputBase, IconButton, TextField, Select, MenuItem } from "@material-ui/core"
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
	const [masterLevel, setMasterLevel] = useState<number>(0)

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
							setMasterLevel(convertMasterLevelToValue(page["Master Level"].select.name))
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

	const convertValueToMasterLevel = (value: number) => {
		switch (value) {
			case 0: return "无法理解"
			case 1: return "思路不OK"
			case 2: return "思路OK实现Hard"
			case 3: return "思路OK实现OK"
			case 4: return "秒杀"
			default: return "无法理解"
		}
	}

	const convertMasterLevelToValue = (masterLevel: string) => {
		switch (masterLevel) {
			case "无法理解": return 0
			case "思路不OK": return 1
			case "思路OK实现Hard": return 2
			case "思路OK实现OK": return 3
			case "秒杀": return 4
			default: return 0
		}
	}

	const modifyItem = () => {
		let data = [noteInput, getDateString(), pageID, practiceTimes, convertValueToMasterLevel(masterLevel)]
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
			<br />
			{practiced && <div>
				掌握程度：
				<Select
					value={masterLevel}
					onChange={(e) => { setMasterLevel(e.target.value as number) }}
				>
					<MenuItem value={0}>无法理解</MenuItem>
					<MenuItem value={1}>思路不OK</MenuItem>
					<MenuItem value={2}>思路OK实现Hard</MenuItem>
					<MenuItem value={3}>思路OK实现OK</MenuItem>
					<MenuItem value={4}>秒杀</MenuItem>
				</Select>

			</div>}
			<TextField
				style={{ width: 270 }}
				placeholder="Add notes ..."
				multiline={true}
				value={noteInput}
				onChange={(event) => setNoteInput(event.target.value)}
			/>

			<br />
			{practiced ? <Button variant="outlined" onClick={handleButtonClick}>Change</Button> :
				<Button variant="outlined" onClick={handleButtonClick}>Add</Button>}
		</Box>
	)
}

const root = document.createElement("div")
document.body.appendChild(root)
ReactDOM.render(<App />, root)
