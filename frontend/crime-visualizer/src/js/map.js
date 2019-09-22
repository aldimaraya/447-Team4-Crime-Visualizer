import 'bootstrap/dist/css/bootstrap.min.css';
import ReactMapGL, {NavigationControl,FullscreenControl,SVGOverlay,Popup, Marker} from 'react-map-gl';
import React from 'react';
import Controller from './controllers.js';
import '@fortawesome/fontawesome-free/css/all.css';

const axios = require('axios').default;

const MAPBOXTOKEN = 'pk.eyJ1IjoiaWRsYSIsImEiOiJjazB2OHNpOXQwNmptM2JsYWFnczBydDA4In0.nWfSkM6z87tzePEXlxENew';

class Map extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
        viewport: {
          latitude: 39.2904,
          longitude: -76.6122,
          zoom: 13
        },
        data: [],
        view: "mapbox://styles/mapbox/light-v9",
        popUpInfo: null,
        isLoading: true
      };
    }

    componentDidMount(){
        axios.get('https://data.baltimorecity.gov/resource/wsfq-mvij.json')
            .then((response) => {
                console.log("Data successfully retrieved");
                console.log(response.data);
                this.setState({data: response.data.slice(1,50), isLoading:false});
            })
            .catch(function (error) {
                console.log("Error: ", error);
        })

        
    }

    // renderMarkers = (crime, index) => {
    //     <Marker
    //         key={`marker-${index}`}
    //         onClick={() => this.setState({popUpInfo: crime})}
    //         latitude={parseFloat(crime.latitude,10)}
    //         longitude={parseFloat(crime.longitude,10)}>
    //             <div>
    //                 <i className="fas fa-map-pin fa-2x red"></i>
    //             </div>
    //     </Marker>
    // }

    renderPopup() {
        const {popUpInfo} = this.state;
    
        return (
          popUpInfo && (
            <Popup
              tipSize={5}
              anchor="top"
              longitude={parseFloat(popUpInfo.longitude, 10)}
              latitude={parseFloat(popUpInfo.latitude,10)}
              closeOnClick={false}
              onClose={() => this.setState({popUpInfo: null})}
            >

            <p>Offense: {popUpInfo.description}</p>
            <p>Location: {popUpInfo.location}</p>
              
            </Popup>
          )
        );
      }

    updateView = (choice) => {
        console.log("Calling updateView", choice);
        if (choice == 'light'){
            this.setState({view: "mapbox://styles/mapbox/light-v9"});
        }

        if (choice == 'dark'){
            this.setState({view: "mapbox://styles/mapbox/dark-v9"});
        }

        if (choice == 'satellite'){
            this.setState({view: "mapbox://styles/mapbox/satellite-v9"});
        }
    }

    _onViewportChange = viewport => this.setState({viewport});

    _onStyleChange = mapStyle => this.setState({mapStyle});

    render(){

        if (this.state.isLoading){
            return(<p>Loading</p>)
        }

        return(
            <div className = 'map'>
                
                <ReactMapGL
                    {...this.state.viewport}
                    onViewportChange={(viewport) => this.setState({viewport})}
                    width="100%"
                    height="100vh"
                    mapStyle = {this.state.view}
                    mapboxApiAccessToken={MAPBOXTOKEN}>

                    {this.renderPopup()}
                    
                    {this.state.data.map((crime, index) => (
                            <Marker
                                key={`marker-${index}`}
                                latitude={parseFloat(crime.latitude,10)}
                                longitude={parseFloat(crime.longitude,10)}>
                                    <div>
                                        <i className="fas fa-map-pin fa-2x red" 
                                        onClick={() => {
                                            console.log(crime);
                                            this.setState({popUpInfo: crime})}}></i>
                                    </div>
                            </Marker>
                        ))
                    }


                    <div className="fullscreen">
                        <FullscreenControl />
                    </div>
                    <div className="nav">
                        <NavigationControl />
                    </div>

                    <Controller updateView = {this.updateView}/>
                </ReactMapGL>

            </div>
        )
    }
}


export default Map;