//399573477414-o4q25m6hbabvgcvd65aag759o9071ndu.apps.googleusercontent.com
global.Buffer = global.Buffer || require('readable-stream').Buffer;

import React, { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Switch, Button, StyleSheet, Linking, Image } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Camera } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library'
import axios from 'axios'
import * as webBrowser from 'expo-web-browser'
import auth from '@react-native-firebase/auth'
import * as Google from 'expo-auth-session/providers/google'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { google } from 'googleapis';
import RNFetchBlob from 'rn-fetch-blob';

import styles from './1.style'
import { COLORS, SIZES, icons, images } from '../../constants'

webBrowser.maybeCompleteAuthSession()

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

	const [isCameraVisible, setIsCameraVisible] = useState({})
	const [hasCameraPermission, setHasCameraPermission] = useState(false)
	const [image, setImage] = useState(null)
	const [type, setType] = useState(Camera.Constants.Type.back)
	const [flash, setFlash] = useState(Camera.Constants.FlashMode.off)
	const cameraRef = useRef(null)

	const scopes = ['https://www.googleapis.com/auth/drive']

	const [request, response, promptAsync] = Google.useAuthRequest({
		clientId: '399573477414-ndn9kb11avof808qb2fstj1r5feoo456.apps.googleusercontent.com',
		androidClientId: '399573477414-bchnbbu5sdp3uv2o6euneq9jeui11oej.apps.googleusercontent.com',
		expoClientId: '399573477414-ndn9kb11avof808qb2fstj1r5feoo456.apps.googleusercontent.com',
		scopes: scopes,
	})

	const [userInfo, setUserInfo] = useState(null)
	const [auth, setAuth] = useState(null)

	const [accessToken, setAccessToken] = React.useState(null)
	const [user, setUser] = React.useState(null)

	useEffect(() => {
		;(async () => {
			MediaLibrary.requestPermissionsAsync()
			const cameraStatus = await Camera.requestCameraPermissionsAsync()
			setHasCameraPermission(cameraStatus.status === 'granted')
		})()
	}, [])

	useEffect(() => {
		if (response?.type === 'success') {
			setAccessToken(response.authentication.accessToken)
			accessToken && fetchUserInfo()
		}
	}, [response, accessToken])

	const accessTokenImage = accessToken // Zmień 'twój_token_dostępu' na właściwy token dostępu
	const folderId = '1AF-FZqNgiIQAaBecq5Z8WBBp1vO8WkvS' // Zmień '1AF-FZqNgiIQAaBecq5Z8WBBp1vO8WkvS' na właściwe ID folderu

	const ShowUserInfo = () => {
		if (user) {
			return (
				<View style={styles.userInfoContainer}>
					<Text style={styles.userInfoText}>Email: {userInfo.email}</Text>
					<Text style={styles.userInfoText}>Imię: {userInfo.given_name}</Text>
					<Text style={styles.userInfoText}>Nazwisko: {userInfo.family_name}</Text>
					<Text style={styles.userInfoText}>ID: {userInfo.id}</Text>
					<Text style={styles.userInfoText}>Link do zdjęcia: {userInfo.picture}</Text>
				</View>
			)
		}
	}

	const fetchUserInfo = async () => {
		let response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		let user = await response.json()
		setUserInfo(user) // Zmiana userInfo na user
		console.log({ user: user }) // Zmiana userInfo na user
	}

	const test = async fileUri => {
		try {
			// Zmień 'ID_Folderu' na właściwe ID folderu
			const folderId = '1AF-FZqNgiIQAaBecq5Z8WBBp1vO8WkvS'
			const apiUrl = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&parents=${folderId}`;
			console.log(fileUri)

			const formData = new FormData()
			formData.append('photo', {
				uri: fileUri,
				type: 'image/jpeg',
				name: 'nazwa_zdjecia.jpg',
			})

			const response = await axios.post(apiUrl, formData, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'multipart/form-data',
				},
			});

			console.log('Plik wysłany na Dysk Google:', response.data)
		} catch (error) {
			console.log('Response', response)
			console.log('Błąd podczas wysyłania pliku:', error)
		}
	}

	const uploadToGoogleDrive = async (imageUri, accessToken) => {
		try {
			const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'

			const headers = {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'multipart/related',
				'Content-Type': 'image/jpeg', // Dodaj ten nagłówek
			}

			const metadata = {
				name: 'nazwa_zdjecia.jpg', // Zastąp 'nazwa_zdjecia' właściwą nazwą pliku
				parents: [folderId],
			}

			const fileData = new FormData()
			fileData.append('metadata', JSON.stringify(metadata))
			fileData.append('file', {
				uri: imageUri,
				type: 'image/jpeg', // Ustaw poprawny typ zawartości dla pliku obrazu
				name: 'nazwa_zdjecia.jpg', // Zastąp 'nazwa_zdjecia' właściwą nazwą pliku
			})

			const response = await axios.post(url, fileData, { headers })

			console.log('URL z dysku Google:', response.data.webViewLink)
		} catch (error) {
			console.error('Błąd podczas przesyłania zdjęcia:', error)
			// Wyświetl szczegółowe informacje o błędzie
			console.log('Error response:', error.response)
		}
	}

	const fileUri = 'file:///storage/emulated/0/DCIM/2279726f-bbed-4e35-bc70-55a3dbb9e83f.jpg'

	const fetchFilesFromFolder = async (folderId, accessToken) => {
		try {
			console.log({ accessToken_fetchfiles: accessToken })
			const response = await axios.get(`https://www.googleapis.com/drive/v3/files`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})

			//console.log('Pliki w folderze:', response)
		} catch (error) {
			console.log('Błąd odczytu plików:', error)
		}
	}

	const takePicture = async () => {
		if (cameraRef) {
			try {
				const data = await cameraRef.current.takePictureAsync()
				setImage(data.uri)

				// Prześlij zdjęcie na Google Drive
				if (token && data.uri) {
					const asset = await MediaLibrary.createAssetAsync(data.uri)
					console.log('saved successfully')
					const assetInfo = await MediaLibrary.getAssetInfoAsync(asset)
					console.log('Asset Info:', assetInfo)
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
				console.log('Asset Info URI:', assetInfo.uri)

				test(assetInfo.uri)
				//uploadToGoogleDrive(assetInfo.uri, accessToken, folderId)
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
				<Button
					title='Sign in with Google'
					disabled={!request}
					onPress={() => {
						promptAsync()
					}}
				/>
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
}

export default One
