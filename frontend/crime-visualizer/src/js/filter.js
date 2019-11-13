import React, {Component} from 'react';
import { Checkbox } from "@blueprintjs/core"; 
import { DateRangeInput } from "@blueprintjs/datetime";

class PFilter extends Component{
    constructor(props){
        super(props);

        this.state = {
        }
    }

    handleEnabledChange = (eventChanged) => {
        this.props.updatePremise(eventChanged.target.id);
    }

    render(){
        return(
            <div>
                <h4 className="bp3-heading"><br/>Crime Filters:</h4>
                {/* <Checkbox checked={this.state.isEnabled} label="All" onChange={this.handleEnabledChange} inline={true}/> */}
                <Checkbox id = "ALLEY" checked={this.state.isEnabled} label="Alley" onChange={this.handleEnabledChange} inline={true}/>
                <Checkbox id = "BAR" checked={this.state.isEnabled} label="Bar" onChange={this.handleEnabledChange} inline={true}/>
                <Checkbox id="CAB" checked={this.state.isEnabled} label="Cab" onChange={this.handleEnabledChange} inline={true}/>
                <Checkbox id = "GARAGE" checked={this.state.isEnabled} label="Garage" onChange={this.handleEnabledChange} inline={true}/>
                <Checkbox id ="SHED" checked={this.state.isEnabled} label="Shed" onChange={this.handleEnabledChange} inline={true}/>
                <Checkbox id ="PARKING LOT-OUTSIDE" checked={this.state.isEnabled} label="Parking Lot-OUTSIDE" onChange={this.handleEnabledChange} inline={true}/>
                <Checkbox id ="PUBLIC BUILDING" checked={this.state.isEnabled} label="Public Building" onChange={this.handleEnabledChange} inline={true}/>
                <Checkbox id ="SHOPPING MALLS/CNTR" checked={this.state.isEnabled} label="Shopping Mall" onChange={this.handleEnabledChange} inline={true}/>
                <Checkbox id ="DEPARTMENT STORE" checked={this.state.isEnabled} label="Department Store" onChange={this.handleEnabledChange} inline={true}/>
                <Checkbox id ="ATM MACHINES" checked={this.state.isEnabled} label="ATM Machines" onChange={this.handleEnabledChange} inline={true}/>
                <Checkbox id ="CHURCH" checked={this.state.isEnabled} label="Church" onChange={this.handleEnabledChange} inline={true}/>
                <Checkbox id ="LIQUOR STORE" checked={this.state.isEnabled} label="Liquor Store" onChange={this.handleEnabledChange} inline={true}/>
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

                <h4 className="bp3-heading"><br/>Time Picker:</h4>
                
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

export {PFilter, DateFilter};