import { useState, useEffect } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
  const [query, setQuery] = useState('')

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

  const handleSubmit = e => {
    e.preventDefault()
    if (query) {
      axios
        .get(
          `${process.env.REACT_APP_API_BASE_URL}/current.json?key=${process.env.REACT_APP_API_KEY}&q=${query}&lang=${language}`
        )
        .then(res => setWeather(res.data))
        .catch(err => {
          const {
            response: {
              data: {
                error: { message }
              }
            }
          } = err
          toast.error(message, {
            position: 'top-left',
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined
          })
        })
      setQuery(current => '')
    }
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

  return (
    <div className='flex flex-col gap-3 mx-10 my-10 p-5'>
      <div className='text-center text-3xl font-bold'>Weather App</div>
      <form onSubmit={e => handleSubmit(e)}>
        <input
          type='text'
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='Type your zip, country or city'
          className='text-2xl w-full outline-none py-5 px-10 border rounded-full shadow-md'
        />
      </form>
      {weather.location && weather.current && (
        <div className='flex flex-col gap-10'>
          <div className='pt-10 flex flex-col justify-center items-center'>
            <img
              src={weather.current.condition.icon}
              alt={`Icon of ${weather.current.condition.text}`}
              className='w-36'
            />
            <h3 className='text-3xl font-bold'>
              {weather.current.condition.text}
            </h3>
          </div>
          <div className='flex gap-3 justify-between'>
            <ul className='border shadow-md rounded-lg w-full p-5'>
              {Object.keys(weather.location).map((entry, index) => {
                const { location } = weather
                return (
                  <li key={index}>
                    {entry} : {location[entry]}
                  </li>
                )
              })}
            </ul>
            <ul className='border shadow-md rounded-lg w-full p-5'>
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
      <ToastContainer />
    </div>
  )
}

export default App
