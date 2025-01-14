import { StyleSheet } from 'react-native'
import styleconstants from '../../shared/styles/styleconstants'

export default StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#ffffff'
  },

  gameName: {
    fontFamily: styleconstants.primaryFontBold,
    fontSize: 16,
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 5
  },

  checkboxContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
    paddingLeft: 15,
    paddingBottom: 0,
    paddingTop: 0
  },

  wishlistDropDownWrapper: {
    paddingLeft: 55,
    paddingRight: 20
  }
})
