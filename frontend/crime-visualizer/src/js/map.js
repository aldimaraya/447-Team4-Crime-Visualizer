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
            pin_color: 'premise',
            filter: {},
            premise: {},
            description: {},
            premise_colors: {},
            description_colors: {}
      };
    }


    //Loads initial data with initial query
    componentDidMount(){

        console.log("Retrieving data...");
        var filter =  {
            crime: {
                crimedate: { after: "08/13/2019", before: "12/12/2019"},
                premise: {is: ["ROW/TOWNHOUSE-OCC","STREET","ALLEY","PARKING LOT-OUTSIDE","LIQUOR STORE","SHED/GARAGE","GAS STATION","APT/CONDO - OCCUPIED","OTHER - OUTSIDE","PARKING LOT-INSIDE","BANK/FINANCIAL INST","CONVENIENCE STORE","HOTEL/MOTEL","SCHOOL","DRUG STORE / MED  BL"]},
                description: {is: ["LARCENY","BURGLARY","ROBBERY - RESIDENCE","ROBBERY - STREET","LARCENY FROM AUTO","AUTO THEFT","SHOOTING","HOMICIDE","AGG. ASSAULT","COMMON ASSAULT","ROBBERY - COMMERCIAL","ROBBERY - CARJACKING","ARSON","RAPE"]},
                crimetime: { after: "15:00:00", before: "18:00:00"}
            }
        }

        this.updateData(filter);
        
        document.getElementById("map").addEventListener("contextmenu", evt => evt.preventDefault());
        this.setState({isLoading:false});
    }

    //Function to update the data whenever a new filter is requested
    updateData = (filter) => {
        console.log(filter);
        this.setState({filter: filter});
        axios.post(hostName + '/db/filter/', filter)
            .then((response) => {
                console.log("Data successfully retrieved");
                console.log(response.data['crime']);
                this.setState({data: response.data['crime'], housingVals: response.data['realestate']});
                this.updateStats();
            })
            .catch((error) => {
                console.log("Error: ", error);
        })

        axios.get(hostName + '/info/tables/crime/premise')
            .then((response) => {
                this.assignPremiseColor(response.data.values);
            })

        axios.get(hostName + '/info/tables/crime/description')
            .then((response) => {
                this.assignDescriptionColor(response.data.values);
            })
    }

    assignPremiseColor = (premise) => {
        console.log(premise);
        var premiseColor = this.state.premise_colors;
        premise.forEach((item, index) => {
            if (!(item in premiseColor)){
                var count = 0;
                var color = [];
                while (count != 3){
                    var rand = Math.floor(Math.random() * (255));
                    color.push(rand);
                    count += 1;
                }
                premiseColor[item] = color;
            }
        });
        this.setState({premise_colors: premiseColor});
    }

    assignDescriptionColor = (description) => {
        var descColor = this.state.description_colors;
        description.forEach((item, index) => {
            if (!(item in descColor)){
                var count = 0;
                var color = [];
                while (count != 3){
                    var rand = Math.floor(Math.random() * (255));
                    color.push(rand);
                    count += 1;
                }
                descColor[item] = color;
            }
        });
        this.setState({description_colors: descColor});
    }

    updateStats = () => {
        var premise = {};
        var description = {};
        if (!this.props.data){
            //Premise

            this.state.data.forEach((item, index) => {
                if (item.premise in premise){
                    premise[item.premise] += 1;
                }else{
                    premise[item.premise] = 1;
                }

                if (item.description in description){
                    description[item.description] += 1;
                }else{
                    description[item.description] = 1;
                }
            });
            console.log(premise);
            console.log(description);
        }
        this.setState({premise, description});
    }


    //Update time frame
    updateTimeframe = (startDate, endDate) => {
        console.log(endDate);
       var newFilter = this.state.filter;

       newFilter.crime.crimedate.after = startDate;
       newFilter.crime.crimedate.before = endDate;

       this.updateData(newFilter);
    }

    updateTimeOfDay = (range) => {
        var newFilter = this.state.filter;

        console.log(newFilter);
        newFilter.crime.crimetime = {};

        var timeStart = range[0] + ":00:00";
        var timeEnd = range[1] + ":00:00";

        console.log(timeStart.padStart(8, '0'), timeEnd.padStart(8, '0'));

        newFilter.crime.crimetime.after = timeStart.padStart(8, '0');
        newFilter.crime.crimetime.before = timeEnd.padStart(8, '0');

        this.updateData(newFilter);
    }

    updatePremise = ( premise ) => {
        console.log(premise);
        var newFilter = this.state.filter;

        if(newFilter.crime.premise.is.indexOf(premise) < 0){
            newFilter.crime.premise.is.push(premise);    
        }else{
            newFilter.crime.premise.is.splice(newFilter.crime.premise.is.indexOf(premise), 1);
        }

        this.updateData(newFilter);
    }

    updateDescription = ( description ) => {
        var newFilter = this.state.filter;

        if(newFilter.crime.description.is.indexOf(description) < 0){
            newFilter.crime.description.is.push(description);
        }else{
            newFilter.crime.description.is.splice(newFilter.crime.description.is.indexOf(description), 1);
        }

        this.updateData(newFilter);
    }

    updateColor = (mode) => {
        this.setState({pin_color: mode});
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

    _color = (d) => {
        return this.state.pin_color === "premise" ? this.state.premise_colors[d.premise] : this.state.description_colors[d.description];
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
            getFillColor: this._color,
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

    //Updates look
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

    //Update data projection
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
        }else{

        return(
            <div className = 'map'>

                
                <Controller updateView = {this.updateView} 
                    updateDataView = {this.updateDataView} 
                    updateMarker = {this.renderMarkers} 
                    updateDate = {this.updateTimeframe}
                    updatePremise = {this.updatePremise}
                    updateDescription = {this.updateDescription}
                    updateTime = {this.updateTimeOfDay}
                    updateColor = {this.updateColor}
                    data={this.state.data}
                    filter={this.state.filter}
                    premise={this.state.premise}
                    description={this.state.description}
                    premise_colors={this.state.premise_colors}
                    description_colors={this.state.description_colors}
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
}


export default Map;