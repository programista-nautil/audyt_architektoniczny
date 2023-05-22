let url = 'https://docs.google.com/spreadsheets/d/1ttdyySavO0xv94NQ_7phpT0csOJHY8_9qlJ5fU3noCs/edit#gid=1236216935' // url production
let ss = SpreadsheetApp.openByUrl(url) // Please set the Spreadsheet ID.
let sheetDane = ss.getSheetByName('0. Podstawowe dane')
const sheetDaneValues = sheetDane.getDataRange().getValues()
const first = ss.getSheetByName('1. Otoczenie zewnętrzne')
// let folder = DriveApp.getFolderById('1i1WCRMXzTRRoFHU3aP-MY1NBSFwoUR0v') //dev
let folder = DriveApp.getFolderById('1P5uDoECsl3Aj8l_BWLmUdjEFXw8Ie6i0') //production
const imgs = DriveApp.getFolderById('1AF-FZqNgiIQAaBecq5Z8WBBp1vO8WkvS')

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
	tableCopy(1, 1, first.getLastRow(), 4)
	categoryCopy()
	fileDocOpen.saveAndClose()
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

	for (const [placeholder, value] of Object.entries(values)) {
		body.replaceText(placeholder, value)
		header.getParent().replaceText(placeholder, value)
	}

	return body
}

const tableCopy = (r, c, nr, nc, x) => {
	// przekopiowanie ze stylami tabeli KS do DOC

	let rangeTable = first.getRange(r, c, nr, nc)
	let valuesTable = rangeTable.getValues()

	let stylesTable = rangeTable.getTextStyles()
	let backgroundColorss = rangeTable.getBackgrounds()

	const range = body.findText('{{wynikiOceny2}}')
	let textElement = range.getElement()

	if (textElement) {
		let paragraph = textElement.getParent()
		let parent = paragraph.getParent()
		if (parent.getType() === DocumentApp.ElementType.BODY_SECTION) {
			let offset = parent.getChildIndex(paragraph)
			let table = parent.insertTable(offset + 1, valuesTable)
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
}

//Kopiowanie tablicy z kryteriami sukcesu i opisami
const categoryCopy = () => {
	let rangeTable = first.getRange(4, 6, first.getLastRow(), 11).getValues()

	for (let row of rangeTable) {
		if (row[0] !== '') {
			let kategoria = row[0]
			let rodzaj = row[2]
			let czas = row[8]
			let kryterium = row[3]
			let kosztownosc = row[7]
			let zalecenia = row[5]
			let ikona1 = row[3]
			let ikona2 = row[4]
			let ikona3 = row[5]
			let ikona4 = row[6]
			let zdjecie = row[9]

			body.appendHorizontalRule()
			body.appendParagraph(kategoria).setHeading(DocumentApp.ParagraphHeading.HEADING2)
			body.appendHorizontalRule()
			if (ikona1 === true) {
				// Wstaw zdjęcie do dokumentu
				let imageBlob = imageFile.getBlob()
				let image = body.appendImage(imageBlob)

				// Ustaw rozmiar zdjęcia
				image.setHeight(200)
				image.setWidth(200) // Zastąp 'Ikona1' odpowiednią nazwą ikony
			}

			if (ikona2 === true) {
				iconsToAdd.push('Ikona2') // Zastąp 'Ikona2' odpowiednią nazwą ikony
			}

			if (ikona3 === true) {
				iconsToAdd.push('Ikona3') // Zastąp 'Ikona3' odpowiednią nazwą ikony
			}

			if (ikona4 === true) {
				iconsToAdd.push('Ikona4') // Zastąp 'Ikona4' odpowiednią nazwą ikony
			}
			body.appendParagraph('Rodzaj: ' + rodzaj).setHeading(DocumentApp.ParagraphHeading.HEADING3)
			body
				.appendParagraph('Czas potrzebny na spełnienie kryterium: ' + czas)
				.setHeading(DocumentApp.ParagraphHeading.HEADING3)
			body.appendParagraph('Kosztowność: ' + kosztownosc).setHeading(DocumentApp.ParagraphHeading.HEADING3)
			body.appendHorizontalRule()
			body.appendParagraph('Zalecenia: ' + zalecenia).setHeading(DocumentApp.ParagraphHeading.HEADING3)
			body.appendParagraph('Zdjęcie')
		}
	}
}
