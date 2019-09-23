import Graphs from './graphs.js';
import React, {Component} from 'react';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input} from 'reactstrap';

class Controller extends Component{

    constructor(props){
        super(props);
        this.state = {
            popup: false,
            mapStyle:'light',
            dataStyle:'pins'
        }

        this.toggleGraphs = this.toggleGraphs.bind(this);
    }

    toggleGraphs(){
        this.setState({popup: !this.state.popup});
    }

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

                <Form>
                    <FormGroup>
                        <legend>Map Styles:</legend>
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
                        <legend>Data Styles:</legend>
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
                    </FormGroup>
                </Form>
                
                <Modal isOpen={this.state.popup} toggle={this.toggleGraphs}>
                    <ModalHeader>Graphs</ModalHeader>
                    <ModalBody>
                        <Graphs />
                    </ModalBody>
                    <ModalFooter>Footer</ModalFooter>
                </Modal>
                
            </div>
        )
    }
}

export default Controller;