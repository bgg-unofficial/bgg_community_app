import Sentry from 'sentry-expo'
import parse from 'xml-parser'
import { AsyncStorage } from 'react-native'

export const fetchCollection = async (username, force) => {
  if (!username) {
    return false
  }

  const updatedAt = null
  console.log({ username })

  const aDayAgo = new Date().getTime() - 1000 * 60 * 60 * 24
  if (updatedAt > aDayAgo && !force) {
    console.log('Collection fetched less than 24 hours ago, so skipping fetch.')
    return false
  }

  const url = `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}`

  try {
    let response = await fetch(url)

    if (response.status == 202) {
      setTimeout(fetchCollection, 5000)
    } else if (response.status == 200) {
      let xml = await response.text()

      let doc = await parseXML(xml)

      let games = doc.root.children.map(item => {
        let objectId = item.attributes.objectid
        let name = item.children.find(e => e.name == 'name').content
        let yearpublished = (
          item.children.find(e => e.name == 'yearpublished') || {}
        ).content
        let image = (item.children.find(e => e.name == 'image') || {}).content
        let thumbnail = (item.children.find(e => e.name == 'thumbnail') || {})
          .content

        let status = item.children.find(e => e.name == 'status') || {}
        let own = status.attributes.own == '1'
        let wishlist = status.attributes.wishlist == '1'

        let subtitle = `Year: ${yearpublished}`

        return {
          objectId,
          name,
          subtitle,
          yearpublished,
          image,
          thumbnail,
          own,
          wishlist
        }
      })

      let removeDuplicates = (myArr, prop) => {
        return myArr.filter((obj, pos, arr) => {
          return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
        })
      }

      games = removeDuplicates(games, 'objectId')

      try {
        const updatedAt = new Date().getTime()

        AsyncStorage.setItem(
          '@BGGApp:collection',
          JSON.stringify({ games, updatedAt })
        )
      } catch (error) {
        Sentry.captureException(error)
      }

      return games
    } else {
      Sentry.captureMessage(
        'Non 200/202 Response from BGG when loading collection.',
        (extra: { url: url, stauts: response.status })
      )
    }
  } catch (error) {
    Sentry.captureException(error)
  }
  return []
}

export const loadCollection = async updatedAt => {
  if (!updatedAt) {
    try {
      const value = await AsyncStorage.getItem('@BGGApp:collection')
      if (value !== null) {
        const { games, updatedAt } = JSON.parse(value)

        return { games, updatedAt }
      }
    } catch (error) {
      Sentry.captureException(error)
      return {}
    }
  }
}

const parseXML = async xml => new Promise(resolve => resolve(parse(xml)))
