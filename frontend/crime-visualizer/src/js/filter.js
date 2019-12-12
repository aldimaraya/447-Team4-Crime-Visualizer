import React, {Component} from 'react';
import { Checkbox, RangeSlider, Collapse, Button, Icon } from "@blueprintjs/core"; 
import { DateRangeInput } from "@blueprintjs/datetime";
import { IconNames } from "@blueprintjs/icons";

class PFilter extends Component{
    constructor(props){
        super(props);

        this.state = {
            show: true,
            enabled: {}
        }
    }

    componentDidMount = () => {
        const p = Object.keys(this.props.premise).slice(1,16);
        var enabled = {};
        p.forEach((item, index) => (
            enabled[item] = true
        ))

        this.setState({enabled});
    }

    handleEnabledChange = (eventChanged) => {
        this.props.updatePremise(eventChanged.target.id);
        var enabled = this.state.enabled;

        enabled[eventChanged.target.id] = !enabled[eventChanged.target.id];
        this.setState({enabled});
    }

    toggleSection = () => {
        this.setState({show: !this.state.show});
    }

    render(){
        const p = Object.keys(this.props.premise).slice(1,16);
        return(
            <div>
                <h4 className="bp3-heading" onClick={this.toggleSection}><br/>Premise Filters <Icon icon={this.state.show ? "caret-down" : "caret-up"}/></h4>
                

                <Collapse isOpen={this.state.show}>
                    {p.map((key, index) => (
                        <Checkbox id = {key} checked = {this.state.enabled[key]} label={key} onChange={this.handleEnabledChange} inline={true}/>
                    ))}

                </Collapse>
            </div>
        )
    }
}

class DFilter extends Component{
    constructor(props){
        super(props);

        this.state = {
            show: false,
            enabled: {}
        }
    }

    componentDidMount = () => {
        const d = Object.keys(this.props.description);
        var enabled = {};
        d.forEach((item, index) => (
            enabled[item] = true
        ))

        this.setState({enabled});
    }

    handleEnabledChange = (eventChanged) => {
        this.props.updateDescription(eventChanged.target.id);
        var enabled = this.state.enabled;

        enabled[eventChanged.target.id] = !enabled[eventChanged.target.id];
        this.setState({enabled});
    }

    toggleSection = () => {
        this.setState({show: !this.state.show});
    }

    render(){
        const d = Object.keys(this.props.description);
        return(
            <div>
                <h4 className="bp3-heading" onClick={this.toggleSection}><br/>Means Filters <Icon icon={this.state.show ? "caret-down" : "caret-up"}/></h4>
                

                <Collapse isOpen={this.state.show}>
                    {d.map((key, index) => (
                        <Checkbox id = {key} checked = {this.state.enabled[key]} label={key} onChange={this.handleEnabledChange} inline={true}/>
                    ))}

                </Collapse>
            </div>
        )
    }
    
}

class DateFilter extends Component{
    constructor(props){
        super(props);

        this.state= {
            dateStart: new Date('August 13, 2019'),
            dateEnd: new Date()
        }
    }

    formatDate = d => {
        return (d.getMonth()+1).toString() + '/' + d.getDate().toString() + '/' + d.getFullYear().toString();
    }

    handleRangeChange = selectedRange => {
        console.log(selectedRange);
        if (selectedRange[0] == null || selectedRange[1] == null){
            this.props.updateDate(this.formatDate(this.state.dateStart), this.formatDate(this.state.dateEnd));
        }else{
            this.setState({dateStart: selectedRange[0], dateEnd: selectedRange[1]});
            this.props.updateDate(this.formatDate(selectedRange[0]), this.formatDate(selectedRange[1]));
        }
    }

    render(){
        return(
            <div>

                <h4 className="bp3-heading"><br/>Date Picker:</h4>
                
                <DateRangeInput
                    formatDate={date => this.formatDate(date)}
                    onChange={this.handleRangeChange}
                    parseDate={str => new Date(str)}
                    value={[this.state.dateStart, this.state.dateEnd]}
                />

            </div>

        )
    }
}

class TimeFilter extends Component{
    constructor(props){
        super(props);
        this.state = {
            range: [15,18]
        }
    }

    handleTimeChange = (range: NumberRange) => {
        this.setState({ range });
        // this.props.updateTime(range);
    }

    handleTimeRelease = (range: NumberRange) => {
        this.props.updateTime(range)
    }

    render(){
        return(
            <div>
                <h4 className ="bp3-heading"><br/>Time Picker (Hours):</h4>

                <RangeSlider
                    max={24}
                    min={0}
                    onChange={this.handleTimeChange}
                    onRelease={this.handleTimeRelease}
                    value={this.state.range}
                    labelStepSize={2}
                />
            </div>
        )
    }
}

export {PFilter, DFilter, DateFilter, TimeFilter};