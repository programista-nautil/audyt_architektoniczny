// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')

module.exports = {
	transformer: {
		babelTransformerPath: require.resolve('react-native-fs/src/transformer'),
	},
}
