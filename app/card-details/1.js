//399573477414-o4q25m6hbabvgcvd65aag759o9071ndu.apps.googleusercontent.com

import React, { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Switch, Button, StyleSheet, Linking, Image } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Camera } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library'
import axios from 'axios'
import * as webBrowser from 'expo-web-browser'
// import * as Google from 'expo-auth-session/providers/google'
// import AsyncStorage from '@react-native-async-storage/async-storage'

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
	// const [userInfo, setUserInfo] = React.useState(null)
	// const [request, response, promtAsync] = Google.useAuthRequest({
	// 	androidClientId: '399573477414-o4q25m6hbabvgcvd65aag759o9071ndu.apps.googleusercontent.com',
	// })
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

	const [isCameraVisible, setIsCameraVisible] = useState({})
	const [hasCameraPermission, setHasCameraPermission] = useState(false)
	const [image, setImage] = useState(null)
	const [type, setType] = useState(Camera.Constants.Type.back)
	const [flash, setFlash] = useState(Camera.Constants.FlashMode.off)
	const cameraRef = useRef(null)

	useEffect(() => {
		;(async () => {
			MediaLibrary.requestPermissionsAsync()
			const cameraStatus = await Camera.requestCameraPermissionsAsync()
			setHasCameraPermission(cameraStatus.status === 'granted')
		})()
	}, [])

	const takePicture = async () => {
		if (cameraRef) {
			try {
				const data = await cameraRef.current.takePictureAsync()
				console.log(data)
				setImage(data.uri)

				// Prześlij zdjęcie na Google Drive
				if (token && data.uri) {
					const asset = await MediaLibrary.createAssetAsync(data.uri)
					console.log('saved successfully')
					const assetInfo = await MediaLibrary.getAssetInfoAsync(asset)
					console.log('Asset Info:', assetInfo)
					uploadToGoogleDrive(assetInfo, token)
				}
			} catch (e) {
				console.log(e)
			}
		}
	}

	const savePicture = async () => {
		if (image) {
			try {
				const asset = await MediaLibrary.createAssetAsync(image)
				alert('Picture saved! 🎉')
				setImage(null)
				console.log('saved successfully')
				const assetInfo = await MediaLibrary.getAssetInfoAsync(asset)
				console.log('Asset Info:', assetInfo)
				// uploadToGoogleDrive(assetInfo, token)
			} catch (error) {
				console.log(error)
			}
		}
	}

	const getCameraPermission = async () => {
		const permission = PermissionsAndroid.PERMISSIONS.CAMERA
		const hasPermission = await PermissionsAndroid.check(permission)
		if (hasPermission) {
			return true
		}

		const status = await PermissionsAndroid.request(permission)
		return status === 'granted'
	}

	const handleCameraButtonPress = index => {
		setIsCameraVisible(prevState => ({
			...prevState,
			[index]: !prevState[index],
		}))
	}

	return (
		<View style={{ flex: 1, backgroundColor: COLORS.lightWhite, marginHorizontal: 10 }}>
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

			<ScrollView style={styles.container}>
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
								<View>
									<TouchableOpacity onPress={() => handleCameraButtonPress(index)} style={styles.cameraButton}>
										<Text style={styles.cameraButtonText}>Open Camera</Text>
									</TouchableOpacity>

									{isCameraVisible[index] && (
										<View style={styles.cameraContainer}>
											{!image ? (
												<Camera style={styles.camera} type={type} ref={cameraRef} flashMode={flash}>
													<View style={styles.cameraButtons}>
														<Button
															title=''
															icon='retweet'
															onPress={() => {
																setType(
																	type === Camera.Constants.Type.back
																		? Camera.Constants.Type.front
																		: Camera.Constants.Type.back
																)
															}}
														/>
														<Button
															title=''
															onPress={() =>
																setFlash(
																	flash === Camera.Constants.FlashMode.off
																		? Camera.Constants.FlashMode.on
																		: Camera.Constants.FlashMode.off
																)
															}
															icon='flash'
															color={flash === Camera.Constants.FlashMode.off ? 'gray' : '#fff'}
														/>
													</View>
												</Camera>
											) : (
												<Image source={{ uri: image }} style={styles.camera} />
											)}
											{!image ? (
												<Button title='Take a picture' onPress={() => takePicture(index)} icon='camera' />
											) : (
												<View style={styles.cameraButtons}>
													<Button title='Re-take' onPress={() => setImage(null)} icon='retweet' />
													<Button title='Save' onPress={savePicture} icon='check' />
												</View>
											)}
										</View>
									)}
								</View>
							</View>
						)}
					</TouchableOpacity>
				))}
			</ScrollView>
			<TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
				<Text style={styles.submitButtonText}>WYŚLIJ</Text>
			</TouchableOpacity>
		</View>
	)

	// return (
	// 	<View style={{ flex: 1, backgroundColor: COLORS.lightWhite, marginHorizontal: 10 }}>
	// 		<Stack.Screen
	// 			options={{
	// 				headerStyle: { backgroundColor: COLORS.lightWhite },
	// 				headerShadowVisible: false,
	// 				headerTitle: 'Powrót',
	// 			}}
	// 		/>
	// 		<View>
	// 			<Text style={styles.headerTitle}>1A. Otoczenie zewnętrzne przed wejściem do budynku</Text>
	// 		</View>

	// 		<ScrollView style={styles.container}>
	// 			{elements.map((element, index) => (
	// 				<TouchableOpacity key={index} onPress={() => handleToggle(index)}>
	// 					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
	// 						<Text style={{ flex: 1, fontSize: 16, color: COLORS.tertiary }}>{element.name}</Text>
	// 						<Switch value={openSections[index]} onValueChange={() => handleToggle(index)} />
	// 					</View>
	// 					{openSections[index] && (
	// 						<View style={{ backgroundColor: COLORS.gray2 }}>
	// 							{element.content.map((content, contentIndex) => (
	// 								<View
	// 									key={contentIndex}
	// 									style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
	// 									<Text style={[styles.tabText, { flex: 1 }]}>{content}</Text>
	// 									<Switch
	// 										value={switchValuesContent[index][contentIndex]}
	// 										onValueChange={value => handleSwitchContent(index, contentIndex, value)}
	// 									/>
	// 								</View>
	// 							))}
	// 							<View>
	// 								<TouchableOpacity onPress={handleCameraButtonPress} style={styles.cameraButton}>
	// 									<Text style={styles.cameraButtonText}>Open Camera</Text>
	// 								</TouchableOpacity>

	// 								{isCameraVisible && (
	// 									<View style={styles.cameraContainer}>
	// 										{!image ? (
	// 											<Camera style={styles.camera} type={type} ref={cameraRef} flashMode={flash}>
	// 												<View style={styles.cameraButtons}>
	// 													<Button
	// 														title=''
	// 														icon='retweet'
	// 														onPress={() => {
	// 															setType(type === CameraType.back ? CameraType.front : CameraType.back)
	// 														}}
	// 													/>
	// 													<Button
	// 														title=''
	// 														onPress={() =>
	// 															setFlash(
	// 																flash === Camera.Constants.FlashMode.off
	// 																	? Camera.Constants.FlashMode.on
	// 																	: Camera.Constants.FlashMode.off
	// 															)
	// 														}
	// 														icon='flash'
	// 														color={flash === Camera.Constants.FlashMode.off ? 'gray' : '#fff'}
	// 													/>
	// 												</View>
	// 											</Camera>
	// 										) : (
	// 											<Image source={{ uri: image }} style={styles.camera} />
	// 										)}
	// 										{!image ? (
	// 											<Button title='Take a picture' onPress={takePicture} icon='camera' />
	// 										) : (
	// 											<View style={styles.cameraButtons}>
	// 												<Button title='Re-take' onPress={() => setImage(null)} icon='retweet' />
	// 												<Button title='Save' onPress={savePicture} icon='check' />
	// 											</View>
	// 										)}
	// 									</View>
	// 								)}
	// 							</View>
	// 						</View>
	// 					)}
	// 				</TouchableOpacity>
	// 			))}
	// 		</ScrollView>
	// 		<TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
	// 			<Text style={styles.submitButtonText}>WYŚLIJ</Text>
	// 		</TouchableOpacity>
	// 	</View>
	// )
}

export default One
