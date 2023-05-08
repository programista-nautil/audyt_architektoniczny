import { StyleSheet } from 'react-native'

import { FONT, SIZES, COLORS } from '../../constants'

const styles = StyleSheet.create({
	container: {
		marginBottom: SIZES.xLarge,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: SIZES.large,
		fontFamily: FONT.medium,
		color: COLORS.primary,
		marginTop: SIZES.small,
		marginBottom: SIZES.xxLarge,
	},
	headerBtn: {
		fontSize: SIZES.medium,
		fontFamily: FONT.medium,
		color: COLORS.gray,
	},
	cardsContainer: {
		marginTop: SIZES.medium,
	},
	icon: {
		width: '100%',
		height: 150,
		marginRight: 10,
		borderRadius: 10,
	},
	tabText: (activeJobType, item) => ({
		fontFamily: FONT.medium,
		color: activeJobType === item ? COLORS.secondary : COLORS.gray2,
	}),
	submitButton: {
		marginTop: 30,
		height: 50,
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: COLORS.primary,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	submitButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: COLORS.white,
	},
})

export default styles
