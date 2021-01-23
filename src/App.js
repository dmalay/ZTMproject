import React, { Component } from 'react'
import Clarifai from 'clarifai'
import Navigation from './conponents/navigation/navigation'
import Logo from './conponents/logo/logo'
import ImageLinkForm from './conponents/imagelinkform/imagelinkform'
import Rank from './conponents/rank/rank'
import FaceRecognition from './conponents/FaceRecognition/FaceRecognition'
import SignIn from './conponents/SignIn/SignIn'
import Register from './conponents/Register/Register'
import './App.css'

const app = new Clarifai.App({
  apiKey: '26d8c99e472f44f494133b2777ac399a'
})


class App extends Component {
  constructor() {
    super()
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box });
  }

  onInputChange = (e) => {
    this.setState({ input: e.target.value })
  }

  onRouteChange = (route) => {
    if( route === 'signout') {
      this.setState({isSignedIn: false})
    } else if ( route ==='home') {
      this.setState({isSignedIn: true})
    }
    this.setState({ route: route })
  }

  onButtonClick = () => {
    this.setState({ imageUrl: this.state.input })
    app.models
      .predict(
        // ('c0c0ac362b03416da06ab3fa36fb58e3', this.state.input)
        Clarifai.FACE_DETECT_MODEL,
        // 'http://ufatime.ru/media/ft/e7/28/e7283799-65c1-422e-a145-488696dcb891/face-250719.jpg__430x322_q85_crop_subsampling-2_upscale.jpg'
        this.state.input
      )
      .then(response => {
        this.calculateFaceLocation(response)
        console.log('hi', response.outputs[0].data.regions[0].region_info.bounding_box)
        if (response) {
          fetch('http://localhost:3001/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })

        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err))
  }

  render() {
    const { imageUrl, route, box, isSignedIn } = this.state
    return (
      <div className="App">
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
        { route === 'home'
          ?
          <div>
            <Logo />
            <Rank
            name={this.state.user.name}
            entries={this.state.user.entries}
            />
            <ImageLinkForm onInputChange={this.onInputChange} onButtonClick={this.onButtonClick} />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
          : (
            route === 'signin'
              ? <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
              : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
          )
        }
      </div>
    )
  }
}

export default App;
