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
      route: 'signin'
    }
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
    this.setState({route: route})
  }

  onButtonClick = () => {
    this.setState({ imageUrl: this.state.input })
    app.models
      .predict(
        // HEADS UP! Sometimes the Clarifai Models can be down or not working as they are constantly getting updated.
        // A good way to check if the model you are using is up, is to check them on the clarifai website. For example,
        // for the Face Detect Mode: https://www.clarifai.com/models/face-detection
        // If that isn't working, then that means you will have to wait until their servers are back up. Another solution
        // is to use a different version of their model that works like: `c0c0ac362b03416da06ab3fa36fb58e3`
        // so you would change from:
        // .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
        // to:
        // .predict('c0c0ac362b03416da06ab3fa36fb58e3', this.state.input)
        Clarifai.FACE_DETECT_MODEL,
        // 'http://ufatime.ru/media/ft/e7/28/e7283799-65c1-422e-a145-488696dcb891/face-250719.jpg__430x322_q85_crop_subsampling-2_upscale.jpg'
        this.state.input
      )
      .then(response => {
        this.calculateFaceLocation(response)
        console.log('hi', response.outputs[0].data.regions[0].region_info.bounding_box)
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err))
  }

  render() {
    const { imageUrl } = this.state
    return (
      <div className="App">
        <Navigation onRouteChange={this.onRouteChange} />
        { this.state.route === 'signin'
          ? <SignIn onRouteChange={this.onRouteChange} />
          : <div>
            <Logo />
            <Rank />
            <ImageLinkForm onInputChange={this.onInputChange} onButtonClick={this.onButtonClick} />
            <FaceRecognition box={this.state.box} imageUrl={imageUrl} />
          </div>
        }
      </div>
    )
  }
}

export default App;
