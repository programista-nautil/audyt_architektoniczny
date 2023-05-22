const SHEET_URL =
	'https://docs.google.com/spreadsheets/d/1ttdyySavO0xv94NQ_7phpT0csOJHY8_9qlJ5fU3noCs/edit#gid=414774717'
const SHEET_NAME = 'ImportData'
const importData = SpreadsheetApp.openByUrl(SHEET_URL).getSheetByName('ImportData')
const otoczenieZewnetrzne = SpreadsheetApp.openByUrl(SHEET_URL).getSheetByName('1. Otoczenie zewnętrzne')

function doPost(e) {
	const data = JSON.parse(e.postData.contents)

	const sheet = SpreadsheetApp.openByUrl(SHEET_URL).getSheetByName(SHEET_NAME)

	// Zapisz dane do arkusza
	const rows = data.elements.map(element => {
		const row = []
		row.push(element.name)
		row.push(element.isOpen ? 'Tak' : 'Nie')
		if (element.isOpen && element.content) {
			const contentValues = element.content.reduce((acc, cur) => {
				if (cur.state === 'Tak') {
					acc.push(cur.text + 'xyz')
				} else if (cur.state === 'Nie') {
					acc.push(cur.text + 'xyz')
				} else if (cur.state === 'Nie dotyczy') {
					acc.push(cur.text + 'xyz')
				}
				return acc
			}, [])
			row.push(contentValues.join(', '))
		} else {
			row.push('')
		}
		return row
	})

	sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows)
	sheet.appendRow(['Otoczenie zewnętrzne'])

	return ContentService.createTextOutput('Dane zostały zapisane w arkuszu')
}

const audit = () => {
	const importDataSheet = importData.getDataRange().getValues()

	const howManyRepeat = howManyTables(importDataSheet) // ile razy powtórzyć tabelę
	repeatTables(otoczenieZewnetrzne.getDataRange(), howManyRepeat) // skopiuj tabelę do arkusza
	pasteData(howManyRepeat) // wklej dane do arkusza otoczenieZewnetrzne
}

//funkcje pomocnicze

// stwórz funkcję która zliczy ile jest wystąpień słowa "Otoczenie zewnętrzne" w kolumnie A
const howManyTables = data => {
	const count = data.reduce((acc, cur) => {
		if (cur[0] === 'Otoczenie zewnętrzne') {
			acc++
		}
		return acc
	}, 0)
	return count
}

//copy table from otoczenieZewnetrzne to otozenieZewnetrzne times = howManyRepeat
const repeatTables = (data, repeats) => {
	let lastRow = otoczenieZewnetrzne.getLastRow()

	for (let i = 0; i < repeats; i++) {
		let destinationRange = otoczenieZewnetrzne.getRange(lastRow + 3, 1)
		data.copyTo(destinationRange)
	}
}

//paste data from importData to otoczenieZewnetrzne
function pasteData(howManyRepeat) {
	var dataToUpdate = []
	var otoczenieZewnetrzneColumn = otoczenieZewnetrzne.getRange(4, 3, otoczenieZewnetrzne.getLastRow() + 2, 1)
	var otoczenieZewnetrzneSentences = otoczenieZewnetrzne.getRange(4, 2, 7, 1).getValues()
	const importDatas = importData.getDataRange().getValues()

	var categoryMappings = new Map([
		['CIĄGI KOMUNIKACYJNE', { count: 7 }],
		['SCHODY ZEWNĘTRZNE', { count: 4 }],
		['WYPOSAŻENIE ZEWNĘTRZNE', { count: 2 }],
		['OZNACZENIA I TABLICE INFORMACYJNE', { count: 2 }],
		['OŚWIETLENIE ZEWNĘTRZNE', { count: 3 }],
		['Otoczenie zewnętrzne', { count: 4 }],
	])

	for (var row of importDatas) {
		var category = row[0]
		var requirement = row[1]

		switch (category) {
			case 'CIĄGI KOMUNIKACYJNE':
				otoczenieZewnetrzneSentences = otoczenieZewnetrzne.getRange(4, 2, 7, 1).getValues()
				break
			case 'SCHODY ZEWNĘTRZNE':
				otoczenieZewnetrzneSentences = otoczenieZewnetrzne.getRange(12, 2, 4, 1).getValues()
				break
			case 'WYPOSAŻENIE ZEWNĘTRZNE':
				otoczenieZewnetrzneSentences = otoczenieZewnetrzne.getRange(17, 2, 2, 1).getValues()
				break
			case 'OZNACZENIA I TABLICE INFORMACYJNE':
				otoczenieZewnetrzneSentences = otoczenieZewnetrzne.getRange(20, 2, 2, 1).getValues()
				break
			case 'OŚWIETLENIE ZEWNĘTRZNE':
				otoczenieZewnetrzneSentences = otoczenieZewnetrzne.getRange(23, 2, 3, 1).getValues()
				break
			case 'Otoczenie zewnętrzne':
				break
		}
		var mapping = categoryMappings.get(category)
		if (!mapping) continue

		if (requirement === 'Nie' && category !== 'Otoczenie zewnętrzne') {
			for (var i = 0; i < mapping.count; i++) {
				dataToUpdate.push(['Nie dotyczy'])
			}
			dataToUpdate.push([''])
		} else if (requirement === 'Tak' && category !== 'Otoczenie zewnętrzne') {
			var sentences = row[2].split(/(?=[A-ZĄĆĘŁŃÓŚŹŻĄĆĘŁŃÓŚŹŻ])/)

			foundMatch = false // Reset foundMatch for each original sentence
			for (var receivedSentence of sentences) {
				Logger.log(receivedSentence)
				if (receivedSentence.includes('takxyz')) {
					dataToUpdate.push(['Tak'])
				} else if (receivedSentence.includes('niexyz')) {
					dataToUpdate.push(['Nie'])
				} else if (receivedSentence.includes('nie dotyczyxyz')) {
					dataToUpdate.push(['Nie dotyczy'])
				}
			}

			dataToUpdate.push([''])
		} else if (requirement === '' && category === 'Otoczenie zewnętrzne') {
			for (var i = 0; i < mapping.count; i++) {
				dataToUpdate.push([''])
			}
		}
	}
	Logger.log(dataToUpdate)
	otoczenieZewnetrzneColumn.setValues(dataToUpdate)
}
