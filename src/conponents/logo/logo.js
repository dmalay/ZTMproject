import React from 'react'
// import Tilt from 'react-tilt'
import brain from './brain.png'
import './logo.css'

const Logo = () => {
  return (
    <div className='logo ma4 mt0'>
        <div className="br2 shadow-2 pa3">
          <img style={{paddingTop: '5px'}} alt='logo' src={brain}/>
        </div>
    </div>
  )
}

export default Logo