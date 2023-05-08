import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Switch, Button, StyleSheet } from 'react-native'
import { Stack, useRouter } from 'expo-router'

import axios from 'axios'

import styles from './1.style'
import { COLORS, SIZES, icons, images } from '../../constants'

const elements = [
	{
		name: 'TRASA DOJŚCIA DO BUDYNKU',
		content: ['Brak słupków zawężających trasę'],
	},
	{
		name: 'WYPOSAŻENIE NA TRASIE DOJŚCIA',
		content: [
			'Trasa dojścia do budynku wolna od przeszkód',
			'Wyposażenie i elementy małej architektury znajdują się poza szerokością 1,8 m trasy dojścia do budynku',
		],
	},
	{
		name: 'OZNACZENIA I TABLICE INFORMACYJNE',
		content: ['Czytelne tablice informacyjne w języku symbolicznym lub obrazkowym'],
	},
	{
		name: 'OŚWIETLENIE',
		content: [
			'Trasa dojścia do budynku jest dobrze oświetlona',
			'Rozstaw opraw oświetleniowych umożliwia równomierną dystrybucję światła',
			'Nie występują miejsca niedoświetlone',
		],
	},
]

const One = () => {
	const [openSections, setOpenSections] = useState({})
	const [switchValues, setSwitchValues] = useState(Array(elements.length).fill(false))
	const [switchValuesContent, setSwitchValuesContent] = useState(
		Array(elements.length)
			.fill(null)
			.map(_ => Array(3).fill(false))
	)

	const handleToggle = index => {
		setOpenSections(prevState => ({
			...prevState,
			[index]: !prevState[index],
		}))
	}

	const handleSwitch = (index, value) => {
		setSwitchValues(prevState => prevState.map((val, i) => (i === index ? value : val)))
	}

	const handleSwitchContent = (index, contentIndex, value) => {
		setSwitchValuesContent(prevState => {
			const newState = [...prevState]
			newState[index][contentIndex] = value
			return newState
		})
	}

	const handleSubmit = () => {
		const data = {
			switchValues,
			elements: elements.map((element, index) => ({
				...element,
				isOpen: !!openSections[index],
				switchValuesContent: switchValuesContent[index],
			})),
		}

		console.log('Dane do wysłania:', JSON.stringify(data, null, 2))

		axios
			.post(
				'https://script.google.com/macros/s/AKfycbybdRctsWgIVvDK7bkc4pleMMZfkK829xsJNIVoC_hqnnSIO-8ATYi4gu_T6P2Da_e1/exec',
				data
			)
			.then(response => {
				console.log('Odpowiedź:', response.data)
			})
			.catch(error => {
				console.log('Błąd:', error)
			})
	}

	return (
		<ScrollView style={{ flex: 1, backgroundColor: COLORS.lightWhite, marginHorizontal: 10 }}>
			<Stack.Screen
				options={{
					headerStyle: { backgroundColor: COLORS.lightWhite },
					headerShadowVisible: false,
					headerTitle: 'Powrót',
				}}
			/>
			<View>
				<Text style={styles.headerTitle}>1A. Otoczenie zewnętrzne przed wejściem do budynku</Text>
			</View>

			<View style={styles.container}>
				{elements.map((element, index) => (
					<TouchableOpacity key={index} onPress={() => handleToggle(index)}>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Text style={{ flex: 1, fontSize: 16, color: COLORS.tertiary }}>{element.name}</Text>
							<Switch value={openSections[index]} onValueChange={() => handleToggle(index)} />
						</View>
						{openSections[index] && (
							<View style={{ backgroundColor: COLORS.gray2 }}>
								{element.content.map((content, contentIndex) => (
									<View
										key={contentIndex}
										style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
										<Text style={[styles.tabText, { flex: 1 }]}>{content}</Text>
										<Switch
											value={switchValuesContent[index][contentIndex]}
											onValueChange={value => handleSwitchContent(index, contentIndex, value)}
										/>
									</View>
								))}
							</View>
						)}
					</TouchableOpacity>
				))}
				<TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
					<Text style={styles.submitButtonText}>WYŚLIJ</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	)
}

export default One
