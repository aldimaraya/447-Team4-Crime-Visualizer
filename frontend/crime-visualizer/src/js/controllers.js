import Graphs from './graphs.js';
import {PFilter, DFilter,  DateFilter, TimeFilter} from './filter.js';
import React, {Component} from 'react';
import {Button , Collapse, Drawer, Card, Tab, Tabs, TabId, Position, Icon, Overlay, Menu, MenuItem, Popover, Divider} from "@blueprintjs/core";

class Controller extends Component{

    constructor(props){
        super(props);
        this.state = {
            popup: false,
            sidebar: false,
            stats: true,
            info: false,
            mapStyle:'dark',
            dataStyle:'pins',
            mintext: 'Expand Controls',
            numVals: 100,
            colorMode: 'premise',

            style: "bp3-dark",
            currentTab: "views"
        }
    }

    toggleGraphs = () => {
        this.setState({popup: !this.state.popup});
    }

    toggleSideBar = () => {
        this.setState({sidebar: !this.state.sidebar, mintext: this.state.mintext == "Expand Controls" ? "Collapse Controls" : "Expand Controls"});
    }

    toggleStats = () => {
        this.setState({stats: !this.state.stats});
    }

    toggleInfo = () => {
        this.setState({info: !this.state.info});
    }

    formatDate = d => {
        return (d.getMonth()+1).toString() + '/' + d.getDate().toString() + '/' + d.getFullYear().toString();
    }

    onChangeStart = dateStart => {
        this.setState({ dateStart });
        this.props.updateTime(this.formatDate(dateStart), this.formatDate(this.state.dateEnd));
    }

    onChangeEnd = dateEnd => this.setState({dateEnd})

    onChangeSlider = number => this.setState({numVals: number})

    handleViewChange = view => {
        this.setState({mapStyle: view, style: view == 'dark' ? "bp3-dark" : ""});
        this.props.updateView(view);
    }

    handleDataChange = view => {
        this.setState({dataStyle: view});
        this.props.updateDataView(view);
    }

    handleColorChange = mode => {
        this.setState({colorMode: mode});
        this.props.updateColor(mode);
    }

    handleTabChange = (currentTab: TabId) => {
        this.setState({currentTab})
    }



    render(){
        return(
            <div>
            <Card className = {"control-panel " + this.state.style}>
                <h4 className="bp3-heading">Baltimore Crime Visualizer</h4>

                <Button onClick={this.toggleGraphs} className="icons"><Icon icon="graph" iconSize={20}></Icon></Button>
                <Button onClick={this.toggleSideBar} className="icons"><Icon icon="expand-all" iconSize={20}></Icon></Button>
                <Button onClick={this.toggleStats} className = "icons"><Icon icon="panel-stats"></Icon></Button>
                {/* <Button onClick={this.toggleInfo}><Icon icon="info-sign"></Icon></Button> */}
                <Collapse isOpen={this.state.sidebar}>
                    <Tabs className = "top-space" onChange={this.handleTabChange} selectedTabId={this.state.currentTab}>
                        <Tab id="views" title= "Views" panel = {
                            <div>
                            <div className = "cont">
                            <Popover content={
                                <Menu>
                                    <MenuItem text="Dark" onClick = {() => {this.handleViewChange("dark")}} active={this.state.mapStyle === 'dark'}/>
                                    <MenuItem text="Light" onClick = {() => {this.handleViewChange("light")}} active={this.state.mapStyle === 'light'}/>
                                    <MenuItem text="Satellite" onClick = {() => {this.handleViewChange("satellite")}} active={this.state.mapStyle === 'satellite'}/>
                                </Menu>
                            } position={Position.BOTTOM} className="icons">
                                <Button>Map Styles <emsp/><Icon icon="caret-down"/></Button>
                            </Popover>
                        

                            <Popover content={
                                <Menu>
                                    <MenuItem text="Pins" onClick = {() => {this.handleDataChange("pins")}} active={this.state.dataStyle === 'pins'}/>
                                    <MenuItem text="Heatmap" onClick = {() => {this.handleDataChange("heatmap")}} active={this.state.dataStyle === 'heatmap'}/>
                                    <MenuItem text="Bar" onClick = {() => {this.handleDataChange("bar")}} active={this.state.dataStyle === 'bar'}/>
                                </Menu>
                            } position={Position.BOTTOM} className="icons">
                                <Button>Data Styles <emsp/><Icon icon="caret-down"/></Button>
                            </Popover>
                  

                            <Popover content={
                                <Menu>
                                    <MenuItem text="Premise" onClick = {() => {this.handleColorChange("premise")}} active={this.state.colorMode === 'premise'}/>
                                    <MenuItem text="Means" onClick = {() => {this.handleColorChange("means")}} active={this.state.colorMode === 'means'}/>
                                </Menu>
                            } position={Position.BOTTOM} className="icons">
                                <Button>Pin Color <emsp/><Icon icon="caret-down"/></Button>
                            </Popover>

                            </div>
                            <div className="cont">
                                <Divider vertical={true}/>

                                <h2 className="bp3-heading" className="cont">Active Filters</h2>
                                <h4 className="bp3-heading">Premise</h4>
                                <p>{this.props.filter.crime.premise.is.map((item, index) => {
                                    const p = this.props.premise_colors;
                                    var rgb = "rgb(0,0,0)"
                                    if (p[item]){
                                        var rgb = "rgb(" + p[item][0] + "," + p[item][1] + "," + p[item][2] + ")";
                                    }
                                    return <span><span className="dot" style={{backgroundColor: rgb}}/>{item}</span>
                                })}</p>

                                <h4 className="bp3-heading">Means</h4>
                                <p>{this.props.filter.crime.description.is.map((item, index) => {
                                    const p = this.props.description_colors;
                                    var rgb = "rgb(0,0,0)"
                                    if(p[item])
                                        rgb = "rgb(" + p[item][0] + "," + p[item][1] + "," + p[item][2] + ")";
                                    return <span><span className="dot" style={{backgroundColor: rgb}}/>{item}</span>
                                })}</p>
                                <h4 className="bp3-heading">Date</h4>
                                <p>{this.props.filter.crime.crimedate.after}-{this.props.filter.crime.crimedate.before}</p>
                                <h4 className="bp3-heading">Time</h4>
                                <p>{this.props.filter.crime.crimetime.after}-{this.props.filter.crime.crimetime.before}</p>

                            </div>
                            </div>


                        }/>

                        <Tab id="filters" title="Filters" panel ={
                            <div className = "cont">

                                <PFilter updatePremise={this.props.updatePremise} premise={this.props.premise_colors}/>
                                <DFilter updateDescription={this.props.updateDescription} description={this.props.description_colors}/> 
                                <DateFilter updateDate={this.props.updateDate}/>
                                <TimeFilter updateTime={this.props.updateTime}/>

                            </div>
                        }/>

                    </Tabs>
                </Collapse>

                <Drawer isOpen={this.state.popup}
                    size={'100%'}
                    position = {Position.TOP}
                    className = "bp3-dark">
                        <Button onClick={this.toggleGraphs}>Close</Button>
                        <Graphs style={this.state.style} />
                </Drawer>

            </Card>
            
            {this.state.stats ? 
                <Card className = {"legend " + this.state.style}>
                    <h3 className="bp3-heading">Stats</h3>
                    <p>Total Points: {this.props.data ? this.props.data.length : 0}</p>
                    
                    <h4 className="bp3-heading">Location:</h4>
                        {this.props.premise == {} ? "" : Object.keys(this.props.premise).map((key, index) => (
                            <li>{key}: {this.props.premise[key]}</li>
                        ))}

                    <Divider vertical={true} className = "cont"/>

                    <h4 className="bp3-heading">Means:</h4>
                        {this.props.description == {} ? "" : Object.keys(this.props.description).map((key, index) => (
                            <li>{key}: {this.props.description[key]}</li>
                        ))}
                </Card> : null
            }

            {/* <Overlay isOpen={this.state.info} onClose={this.toggleInfo}>
                 <h4 className="bp3-heading">Baltimore Crime Visualizer</h4>

                 <p>This application was created by Team 4 of Dr. Dutt's CMSC 447 class for NextCentury. Fall, 2019</p>
            </Overlay> */}
                
        </div>
        )
    }
}

export default Controller;
