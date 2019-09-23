import 'bootstrap/dist/css/bootstrap.min.css';
import ReactMapGL, {NavigationControl,FullscreenControl,SVGOverlay,Popup, Marker} from 'react-map-gl';
import React from 'react';
import Controller from './controllers.js';
import '@fortawesome/fontawesome-free/css/all.css';
import ClipLoader from 'react-spinners/ClipLoader';
import {dataToHeatmap} from './temp-dataParser.js';
import DeckGL from '@deck.gl/react';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';


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
            heatmapdata: [],
            view: "mapbox://styles/mapbox/light-v9",
            popUpInfo: null,
            dataview: 'pins',
            isLoading: true
      };
    }

    componentDidMount(){
        axios.get('https://data.baltimorecity.gov/resource/wsfq-mvij.json')
            .then((response) => {
                console.log("Data successfully retrieved");
                console.log(response.data);
                this.setState({data: response.data.slice(1,200), isLoading:false});
                this.setState({heatMapData: dataToHeatmap(response.data)});
            })
            .catch(function (error) {
                console.log("Error: ", error);
        })
    }

    renderPopup() {
        const {popUpInfo} = this.state;
    
        return (
          popUpInfo && (
            <Popup
              tipSize={9}
              anchor="top"
              longitude={parseFloat(popUpInfo.longitude, 10)}
              latitude={parseFloat(popUpInfo.latitude, 10)}
              closeOnClick={false}
              onClose={() => this.setState({popUpInfo: null})}
            >

            <p>Offense: {popUpInfo.description}<br></br>
               Location: {popUpInfo.location}</p>
              
            </Popup>
          )
        );
      }

    renderMarkers() {
        const {data} = this.state;

        return(
            data && this.state.dataview === 'pins' && (
                this.state.data.map((crime, index) => (
                    crime.latitude && crime.longitude &&
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
            
            )
        )
    }

    renderHeatMap() {

        const {heatMapData} = this.state;

        const layer = new HeatmapLayer({
            id: 'heatmapLayer',
            getPosition: heatMapData => heatMapData.COORDINATES,
            getWeight: heatMapData => heatMapData.WEIGHT    
        });
        
        return(<DeckGL {...this.state.viewport} layers={[layer]} />)


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

    updateDataView = (choice) => {
        console.log(choice);
        this.setState({dataview: choice});
    }

    _onViewportChange = viewport => this.setState({viewport});

    render(){

        if (this.state.isLoading){
            return(
            <div className = "loader">
                <ClipLoader
                    sizeUnit={"px"}
                    size={100}
                    color={'#2b2b2b'}
                    loading={this.state.loading}
                />
              </div>
              )
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
                    {this.renderMarkers()}
                    {this.state.dataview == 'heatmap' ? this.renderHeatMap() : null}
                    


                    <div className="fullscreen">
                        <FullscreenControl />
                    </div>
                    <div className="nav">
                        <NavigationControl />
                    </div>

                    <Controller updateView = {this.updateView} updateDataView = {this.updateDataView}/>
                </ReactMapGL>

            </div>
        )
    }
}


export default Map;