import Graphs from './graphs.js';
import React, {Component} from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input} from 'reactstrap';
import {Button , Collapse, Drawer, Slider} from "@blueprintjs/core";
import DatePicker from 'react-date-picker'
const axios = require('axios').default;

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
            dateStart: new Date('January 13, 2012'),
            dateEnd: new Date()
        }
    }

    toggleGraphs = () => {
        this.setState({popup: !this.state.popup});
    }

    toggleSideBar = () => {
        this.setState({sidebar: !this.state.sidebar, mintext: this.state.mintext == "Expand Controls" ? "Collapse Controls" : "Expand Controls"});
    }

    // get20points = () => {
    //     // get the users filters somehow, we hardcoded these filters in for now
    //     var myFilterSelection = {crime:{limit:20, id:{after:100}}}

    //     // get the data from the backend
    //     axios.post('http://127.0.0.1:5000/db/filter/', myFilterSelection)
    //     .then((response) => {
    //         console.log("Data successfully retrieved");
    //         console.log(response.data);
    //         this.setState({data: response.data['crime'], isLoading:false});
    //     })
    //     .catch(function (error) {
    //         console.log("Error: ", error);
    //     })
    // }

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
        this.setState({mapStyle: changeEvent.target.value});
        this.props.updateView(changeEvent.target.value);
    }
    handleDataChange = changeEvent => {
        this.setState({dataStyle: changeEvent.target.value});
        this.props.updateDataView(changeEvent.target.value);
    }

    render(){
        return(
            <div className = "control-panel">
                <Button onClick={this.toggleGraphs}>Show Graphs</Button>
                <Button onClick={this.toggleSideBar}>{this.state.mintext}</Button>
                {/* <Button onClick={this.get20points}>get 20 POINTS</Button> */}
                <Collapse isOpen={this.state.sidebar}>
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

                    <h4 className="bp3-heading"><br/>Time Picker:</h4>
                    <label>from  </label>
                    <DatePicker 
                        onChange = {this.onChangeStart}
                        value = {this.state.dateStart}
                    />
                    <br></br>
                    <label>to  </label>
                    <DatePicker 
                        onChange = {this.onChangeEnd}
                        value = {this.state.dateEnd}
                    />

                <h4 class="bp3-heading"><br/>Data Points:</h4>

                <Slider initialValue = {this.state.numVals}
                    value={this.state.numVals}
                    max={1000}
                    min={0}
                    labelStepSize = {200}
                    onChange={this.onChangeSlider}
                    // onMouseUp={this.handleSubmit} 
                    >

                </Slider>

                </div>
                </Collapse>
                
                <Drawer isOpen={this.state.popup}
                    size={Drawer.SIZE_LARGE}>
                        <Button onClick={this.toggleGraphs}>Close</Button>
                        <legend>Graphs</legend>
                        <Graphs />
                </Drawer>
                
            </div>
        )
    }
}

export default Controller;