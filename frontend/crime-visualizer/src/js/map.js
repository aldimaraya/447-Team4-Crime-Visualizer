import 'normalize.css/normalize.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'

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

//Update to reflect backend endpoint
const hostName = 'http://127.0.0.1:5000';

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
        var myFilters = {
            crime: {
              crimedate: { after: "01/31/2012" },
              crimetime: { after: "14:00:00", before: "18:00:00" },
              premise: { is: ["ALLEY", "BAR"] }
            }
          }

        console.log(myFilters);
    

        console.log("Retrieving data...");

        axios.post(hostName + '/db/filter/', myFilters)
            .then((response) => {
                console.log("Data successfully retrieved");
                console.log(response.data['crime']);
                this.setState({data: response.data['crime'], isLoading:false});
                this.setState({heatmapdata: dataToHeatmap(response.data)});
            })
            .catch((error) => {
                console.log("Error: ", error);
                this.setState({isLoading:false});
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
            
            <div className = "pop">
                <p>Offense: {popUpInfo.description}<br></br>
                Location: {popUpInfo.location}</p>
            </div>

            </Popup>
          )
        );
      }

    renderMarkers(num) {
        try{
            var data = this.state.data.slice(0,num);
        } catch {
            console.error("oopsie");
        }

        //var currentColors = ["fas fa-map-pin fa-1.5x red", "fas fa-map-pin fa-1.5x blue", "fas fa-map-pin fa-1.5x black"];

        return(
            data && this.state.dataview === 'pins' && (
                data.map((crime, index) => (
                    crime.latitude && crime.longitude &&
                    <Marker
                        key={`marker-${index}`}
                        latitude={parseFloat(crime.latitude,10)}
                        longitude={parseFloat(crime.longitude,10)}>
                            <div>

                                <i className="fas fa-map-pin fa-1.5x red" //{currentColors[crime.id % 3].toString()} // we can make dynamic colors based on crime properties
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

        console.log(this.state.heatmapdata[0].COORDINATES);
        const d = this.state.heatmapdata;

        const layer = new HeatmapLayer({
            id: 'heatmapLayer',
            getPosition: d[0].COORDINATES,
            getWeight: d[0].WEIGHT   
        });

        console.log("Rendering Heatmap");
        
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
                    {this.renderMarkers(200)}
                    {this.state.dataview == 'heatmap' ? this.renderHeatMap() : null}
                    


                    <div className="fullscreen">
                        <FullscreenControl />
                    </div>
                    <div className="nav">
                        <NavigationControl />
                    </div>

                    <Controller updateView = {this.updateView} updateDataView = {this.updateDataView} updateMarker = {this.renderMarkers} data={this.state.data}/>
                </ReactMapGL>

            </div>
        )
    }
}


export default Map;