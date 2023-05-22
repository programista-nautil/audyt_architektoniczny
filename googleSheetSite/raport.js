let url = 'https://docs.google.com/spreadsheets/d/1ttdyySavO0xv94NQ_7phpT0csOJHY8_9qlJ5fU3noCs/edit#gid=1236216935' // url production
let ss = SpreadsheetApp.openByUrl(url) // Please set the Spreadsheet ID.
let sheetDane = ss.getSheetByName('0. Podstawowe dane')
const sheetDaneValues = sheetDane.getDataRange().getValues()
// let folder = DriveApp.getFolderById('1i1WCRMXzTRRoFHU3aP-MY1NBSFwoUR0v') //dev
let folder = DriveApp.getFolderById('1P5uDoECsl3Aj8l_BWLmUdjEFXw8Ie6i0') //production
const imgs = DriveApp.getFolderById('1AF-FZqNgiIQAaBecq5Z8WBBp1vO8WkvS')

Logger.log(sheetDaneValues)
var date = new Date()
var dateString = date.toISOString().split('T')[0]
const zamawiajacy = sheetDaneValues[1][1]

let file = DriveApp.getFileById('1hEp4xDRbERtc91EXtaF4XEO-WBdu4yNMXbbn86ouzpM') // ID szablonu
let fileDoc = file.makeCopy('Raport z Audytu Architektonicznego ' + dateString + ' ' + zamawiajacy, folder)
let fileDocOpen = DocumentApp.openById(fileDoc.getId())
let body = fileDocOpen.getBody()

const header = fileDocOpen.getHeader()

const start = () => {
	copyDataCompanyAudit()
}

function onOpen() {
	var ui = SpreadsheetApp.getUi()

	// Tworzenie menu
	var menu = ui.createMenu('⚙️ Raport z Audytu Architektonicznego')
	menu.addItem('Generuj raport', 'start')
	menu.addToUi()
}

const copyDataCompanyAudit = () => {
	//podmiana w szablonie zmiennych
	const values = {
		'{{zamawiajacy}}': zamawiajacy,
		'{{nazwaBudynku}}': sheetDaneValues[2][1],
		'{{adresBudynku}}': sheetDaneValues[3][1],
		'{{wykonawca}}': sheetDaneValues[4][1],
		'{{dataAudytu}}': sheetDaneValues[5][1].toISOString().split('T')[0],
		'{{tytul}}': sheetDaneValues[6][1],
		'{{dataRaportu}}': sheetDaneValues[7][1].toISOString().split('T')[0],
		'{{autor}}': sheetDaneValues[8][1],
		'{{finalnaDecyzja}}': sheetDaneValues[9][1],
		'{{opisKondygnacje}}': sheetDaneValues[10][1],
		'{{powierzchnia}}': sheetDaneValues[11][1],
	}
	Logger.log(values)

	for (const [placeholder, value] of Object.entries(values)) {
		body.replaceText(placeholder, value)
		header.getParent().replaceText(placeholder, value)
	}

	return body
}

const tableCopy = (r, c, nr, nc, x) => {
	// przekopiowanie ze stylami tabeli KS do DOC

	let rangeTable = sheet.getRange(r, c, nr, nc)
	let valuesTable = rangeTable.getValues()

	let stylesTable = rangeTable.getTextStyles()
	let backgroundColorss = rangeTable.getBackgrounds()

	const range = body.findText('Wykaz adresów URL stron/ekranów')

	if (x === true) {
		// miejsce w którym ma sie dodać tabela
		let ele = range.getElement()
		if (ele.getParent().getParent().getType() === DocumentApp.ElementType.BODY_SECTION) {
			var offset = body.getChildIndex(ele.getParent())
			body.insertTable(offset + 1, valuesTable)
		}
	} else {
		let table = body.appendTable(valuesTable)
		table.setBorderWidth(0.5)

		for (let i = 0; i < table.getNumRows(); i++) {
			for (let j = 0; j < table.getRow(i).getNumCells(); j++) {
				let obj = {
					[DocumentApp.Attribute.BACKGROUND_COLOR]: backgroundColorss[i][j],
					[DocumentApp.Attribute.FONT_SIZE]: stylesTable[i][j].getFontSize(),
					[DocumentApp.Attribute.BOLD]: stylesTable[i][j].isBold(),
				}
				table.getRow(i).getCell(j).setAttributes(obj)
			}
		}
	}
}
