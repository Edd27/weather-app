import { useState, useEffect } from 'react'
import axios from 'axios'

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
}

const App = () => {
  const [language, setLanguage] = useState('')
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  const [weather, setWeather] = useState({})

  if (navigator.geolocation) {
    navigator.permissions
      .query({ name: 'geolocation' })
      .then(function (result) {
        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(position => {
            setLat(position.coords.latitude)
            setLng(position.coords.longitude)
          })
        } else if (result.state === 'prompt') {
          navigator.geolocation.getCurrentPosition(
            position => {
              setLat(position.coords.latitude)
              setLng(position.coords.longitude)
            },
            err => {
              console.warn(`ERROR(${err.code}): ${err.message}`)
            },
            options
          )
        } else if (result.state === 'denied') {
          alert('Permission denied')
        }
      })
  } else {
    alert('Geolocation is not supported by this browser.')
  }

  useEffect(() => {
    setLanguage(navigator.userLanguage || navigator.language)
  }, [language])

  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_API_BASE_URL}/current.json?key=${process.env.REACT_APP_API_KEY}&q=${lat},${lng}&lang=${language}`
      )
      .then(res => setWeather(res.data))
  }, [lat, lng, language])

  console.log(weather, language)

  return (
    <div className='border shadow-md border-gray-200 mx-10 my-10 p-5 rounded-3xl'>
      <div className='border text-center text-3xl font-bold'>Weather App</div>
      {weather.location && weather.current && (
        <div className='border'>
          <div className='border pt-10 flex flex-col justify-center items-center'>
            <h2>{weather.current.condition.text}</h2>
            <img
              src={weather.current.condition.icon}
              alt={`Icon of ${weather.current.condition.text}`}
            />
          </div>
          <div>
            <ul>
              {Object.keys(weather.location).map((entry, index) => {
                const { location } = weather
                return (
                  <li key={index}>
                    {entry} : {location[entry]}
                  </li>
                )
              })}
            </ul>
          </div>
          <div>
            <ul>
              {Object.keys(weather.current).map((entry, index) => {
                const { current } = weather
                return (
                  typeof current[entry] !== 'object' && (
                    <li key={index}>
                      {entry} : {current[entry]}
                    </li>
                  )
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
