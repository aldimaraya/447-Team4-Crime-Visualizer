import 'normalize.css/normalize.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'

import {StaticMap} from 'react-map-gl';
import React from 'react';
import Controller from './controllers.js';
import '@fortawesome/fontawesome-free/css/all.css';
import ClipLoader from 'react-spinners/ClipLoader';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import {HeatmapLayer, GridLayer} from '@deck.gl/aggregation-layers';


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
                zoom: 12,
                pitch: 45
            },
            data: [],
            housingVals: [],
            view: "mapbox://styles/mapbox/dark-v9",
            hoveredObj: null,
            xpos: 0,
            ypos: 0,
            dataview: 'pins',
            isLoading: true,
            filter: {}
      };
    }

    //Function to update the data whenever a new filter is requested
    updateData = (filter) => {
        this.setState({filter: filter});
        axios.post(hostName + '/db/filter/', filter)
            .then((response) => {
                console.log("Data successfully retrieved");
                console.log(response.data['realestate']);
                this.setState({data: response.data['crime'], housingVals: response.data['realestate'], isLoading:false});
            })
            .catch((error) => {
                console.log("Error: ", error);
                this.setState({isLoading:false});
        })
    }

    //Loads initial data with initial query
    componentDidMount(){

        console.log("Retrieving data...");
        var filter =  {
            crime: {
                crimedate: { after: "01/01/2015" },
                premise: { is: ["BAR", "ALLEY"] }
            },
            realestate: {
                est_value: {after: 50000}
            }
        }

        axios.post(hostName + '/db/filter/', filter)
            .then((response) => {
                console.log("Data successfully retrieved");
                console.log(filter);
                console.log(response.data['realestate']);
                this.setState({data: response.data['crime'], housingVals: response.data['realestate'], isLoading:false});
            })
            .catch((error) => {
                console.log("Error: ", error);
                this.setState({isLoading:false});
        })
        
        document.getElementById("map").addEventListener("contextmenu", evt => evt.preventDefault());
    }

    updateTimeframe = (startDate, endDate) => {
       var newFilter = this.state.filter;

       newFilter.crime.crimedate.after = startDate;
       newFilter.crime.crimedate.before = endDate;
        console.log(newFilter);
       this.updateData(newFilter);
    }

    _renderHoveredObj = () => {
        const {xpos, ypos, hoveredObj} = this.state;
    
        return (
          hoveredObj && (
            <div className = "pop" style={{top: ypos, left: xpos}}>
                <p>
                    Offense: {hoveredObj.description}<br></br>
                    Location: {hoveredObj.location}<br></br>
                    Date: {hoveredObj.crimedate} <br></br>
                    Time: {hoveredObj.crimetime}
                </p>
            </div>
          )
        );
    }

    _renderLayer = () => {

        //Heatmap layer
        const hmlayer = new HeatmapLayer({
            id: 'heatmapLayer',
            visible: this.state.dataview == 'heatmap' ? true: false,
            data: this.state.data,
            getPosition: d => [d.longitude, d.latitude],
            getWeight: d => d.total_incidents,
            intensity: 1,
            radiusPixels: 300,
            threshold: 0.8
        });

        //Point layer
        const sclayer = new ScatterplotLayer({
            id: 'scatterplot-layer',
            visible: this.state.dataview == 'pins' ? true: false,
            data: this.state.data,
            pickable: true,
            opacity: 0.8,
            stroked: true,
            filled: true,
            radiusScale: 50,
            radiusMinPixels: 1,
            radiusMaxPixels: 100,
            lineWidthMinPixels: 1,
            getPosition: d => [d.longitude, d.latitude],
            getRadius: d => Math.sqrt(d.exits),
            getFillColor: d => [255, 140, 0],
            getLineColor: d => [0, 0, 0],
            onHover: ({object, x, y}) => {
              this.setState(
                  {hoveredObj: object, xpos: x, ypos: y}
              );
            }
          });

          //Crime bar layer
          const barlayer = new GridLayer({
            id: 'bar-layer',
            visible: this.state.dataview == 'bar' ? true: false,
            data: this.state.data,
            pickable: true,
            extruded: true,
            cellSize: 200,
            elevationScale: 4,
            getPosition: d => [d.longitude, d.latitude],
            // onHover: ({object, x, y}) => {
            //   const tooltip = `${object.position.join(', ')}\nCount: ${object.count}`;
            //   /* Update tooltip
            //      http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
            //   */
            // }
          });

        return [hmlayer, sclayer, barlayer]
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

                
                <Controller updateView = {this.updateView} 
                    updateDataView = {this.updateDataView} 
                    updateMarker = {this.renderMarkers} 
                    updateTime = {this.updateTimeframe}
                    data={this.state.data}
                />
                
                <DeckGL initialViewState={this.state.viewport}
                    controller={true} 
                    onViewportChange={(viewport) => this.setState({viewport})}
                    layers = {this._renderLayer()}>


                <StaticMap reuseMaps 
                    mapboxApiAccessToken = {MAPBOXTOKEN}
                    mapStyle={this.state.view}/>

                {this._renderHoveredObj()}

                </DeckGL>

            </div>
        )
    }
}


export default Map;