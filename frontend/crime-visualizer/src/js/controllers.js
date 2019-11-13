import Graphs from './graphs.js';
import {PFilter, DateFilter} from './filter.js';
import React, {Component} from 'react';
import {Form, FormGroup, Label, Input} from 'reactstrap';
import {Button , Collapse, Drawer, Card, Tab, Tabs, TabId, Position} from "@blueprintjs/core";

class Controller extends Component{

    constructor(props){
        super(props);
        this.state = {
            popup: false,
            sidebar: false,
            mapStyle:'dark',
            dataStyle:'pins',
            mintext: 'Expand Controls',
            numVals: 100,

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

    formatDate = d => {
        return (d.getMonth()+1).toString() + '/' + d.getDate().toString() + '/' + d.getFullYear().toString();
    }

    onChangeStart = dateStart => {
        this.setState({ dateStart });
        this.props.updateTime(this.formatDate(dateStart), this.formatDate(this.state.dateEnd));
    }

    onChangeEnd = dateEnd => this.setState({dateEnd})

    onChangeSlider = number => this.setState({numVals: number})

    handleViewChange = changeEvent => {
        this.setState({mapStyle: changeEvent.target.value, style: changeEvent.target.value == 'dark' ? "bp3-dark" : ""});
        this.props.updateView(changeEvent.target.value);
    }

    handleDataChange = changeEvent => {
        this.setState({dataStyle: changeEvent.target.value});
        this.props.updateDataView(changeEvent.target.value);
    }

    handleTabChange = (currentTab: TabId) => {
        this.setState({currentTab})
    }


    render(){
        return(
            <Card className = {"control-panel " + this.state.style}>
                <h4 className="bp3-heading">Baltimore Crime Visualizer</h4>


                <Button onClick={this.toggleGraphs}>Show Graphs</Button>
                <Button onClick={this.toggleSideBar}>{this.state.mintext}</Button>
                {/* <Button onClick={this.get20points}>get 20 POINTS</Button> */}
                <Collapse isOpen={this.state.sidebar}>
                    <Tabs className = "top-space" onChange={this.handleTabChange} selectedTabId={this.state.currentTab}>
                        <Tab id="views" title= "Views" panel = {

                            <div className = "cont">
                            <Form>
                                <FormGroup>
                                    <h4 className="bp3-heading">Map Styles:</h4>
                                    <FormGroup check>
                                        <Label check>
                                        <Input type="radio" name="radio1" value={'light'} onChange = {this.handleViewChange} checked={this.state.mapStyle === 'light'}/>{' '}
                                            Light
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                        <Input type="radio" name="radio1" value={'dark'} onChange = {this.handleViewChange} checked={this.state.mapStyle === 'dark'}/>{' '}
                                            Dark
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check disabled>
                                        <Label check>
                                        <Input type="radio" name="radio1" value={'satellite'} onChange = {this.handleViewChange} checked={this.state.mapStyle === 'satellite'}/>{' '}
                                            Satellite
                                        </Label>
                                    </FormGroup>
                                </FormGroup>
                            </Form>
                            <Form>
                                <FormGroup>
                                    <h4 className="bp3-heading"><br/>Data Styles:</h4>
                                    <FormGroup check>
                                        <Label check>
                                        <Input type="radio" name="radio1" value={'pins'} onChange = {this.handleDataChange} checked={this.state.dataStyle === 'pins'}/>{' '}
                                            Pins
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                        <Input type="radio" name="radio1" value={'heatmap'} onChange = {this.handleDataChange} checked={this.state.dataStyle === 'heatmap'}/>{' '}
                                            Heatmap
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                        <Input type="radio" name="radio1" value={'bar'} onChange = {this.handleDataChange} checked={this.state.dataStyle === 'bar'}/>{' '}
                                            Bar Graph
                                        </Label>
                                    </FormGroup>
                                </FormGroup>
                            </Form>
                            </div>

                        }/>

                        <Tab id="filters" title="Filters" panel ={
                            <div className = "cont">

                                <PFilter updatePremise={this.props.updatePremise}/>
                                <DateFilter updateDate={this.props.updateDate}/>

                            </div>
                        }/>

                    </Tabs>
                </Collapse>

                <Drawer isOpen={this.state.popup}
                    size={Drawer.SIZE_LARGE}
                    position = {Position.TOP}
                    className = "bp3-dark">
                        <Button onClick={this.toggleGraphs}>Close</Button>
                        <Graphs style={this.state.style} />
                </Drawer>

            </Card>
        )
    }
}

export default Controller;
