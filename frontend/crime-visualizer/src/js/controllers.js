import Graphs from './graphs.js';
import React, {Component} from 'react';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input} from 'reactstrap';

class Controller extends Component{

    constructor(props){
        super(props);
        this.state = {
            popup: false
        }

        this.toggleGraphs = this.toggleGraphs.bind(this);
    }

    toggleGraphs(){
        this.setState({popup: !this.state.popup});
    }

    handleViewChange = changeEvent => {
        console.log(changeEvent.target.value);
        this.props.updateView(changeEvent.target.value);
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
                            <Input type="radio" name="radio1" value={'light'} onChange = {this.handleViewChange}/>{' '}
                                Light
                            </Label>
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                            <Input type="radio" name="radio1" value={'dark'} onChange = {this.handleViewChange}/>{' '}
                                Dark
                            </Label>
                        </FormGroup>
                        <FormGroup check disabled>
                            <Label check>
                            <Input type="radio" name="radio1" value={'satellite'} onChange = {this.handleViewChange}/>{' '}
                                Satellite
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