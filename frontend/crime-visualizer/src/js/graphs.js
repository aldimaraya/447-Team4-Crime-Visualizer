import {
    XYPlot,
    XAxis,
    YAxis,
    VerticalGridLines,
    HorizontalGridLines,
    VerticalBarSeries,
    DiscreteColorLegend,
    RadialChart,
    ArcSeries,
    LabelSeries,
    LineSeries,
    Hint
  } from 'react-vis';
import React, {Component} from 'react';
import '../css/graph.css';

const RAD = Math.PI*2;

class Graphs extends Component{
  constructor(props){
    super(props);

    this.state = {
      weaponData: [
        {angle0: 0, angle: 0.5136*RAD, radius: 150, radius0: 0, color: "#86bbd8", label: "Firearms"},
        {angle0: 0.5136*RAD, angle: 0.7227*RAD, radius: 150, radius0: 0, color: "#f6ae2d", label: "Other"},
        {angle0: 0.7227*RAD, angle: 0.9091*RAD, radius: 150, radius0: 0, color: "#758e4f", label: "Knife"},
        {angle0: 0.9091*RAD, angle: RAD, radius: 150, radius0: 0, color: "#f26419", label: "Hands"},
      ],
      timeData: [
        {x: 1, y: 150},
        {x: 2, y: 255},
        {x: 3, y: 453},
        {x: 4, y: 390},
        {x: 5, y: 789},
        {x: 6, y: 509},
        {x: 7, y: 325},
        {x: 8, y: 213},
        {x: 9, y: 432},
        {x: 10, y: 134},
        {x: 11, y: 98},
        {x: 12, y: 321}
      ],
      value: '',
    }
  }

  render(){
    const {value} = this.state;
    return(
      <div id="graph-wrapper">

      <div id="bar-chart" className="graph">
      <h1 id="bar-chart-title">All Crimes by Type in each District</h1>
      <XYPlot
          xType="ordinal"

          // will eventually be solely in CSS file but for now (i.e. the demo), this stays
          width={700}
          height={300}
          // ********************************************* //
        >
          <DiscreteColorLegend
            style={{fontSize: 11, position: 'absolute', left: '8vw', top: '14vh', color: '#000'}}
            orientation="horizontal"
            items={[
              {
                title: 'Northwestern',
                color: '#F44336'
              },
              {
                title: 'Southwestern',
                color: '#673AB7'
              },
              {
                title: 'Southern',
                color: '#9E9E9E'
              },
              {
                title: 'Central',
                color: '#4CAF50'
              },
              {
                title: 'Northern',
                color: '#7CB5D2'
              },
              {
                title: 'Southwestern',
                color: '#FFEB3B'
              },
              {
                title: 'NorthEastern',
                color: '#795548'
              },
              {
                title: 'Eastern',
                color: '#FF5722'
              },
              {
                title: 'Western',
                color: '#3F51B5'
              },
            ]}
          />
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis
            title="Amount of Crimes (thousands)"
            style={{fontSize: 11}}
          />
          <VerticalBarSeries
            cluster="Northwestern"
            color="#F44336"
            data={[
              {x: 'Arson', y: .221},
              {x: 'Homicide', y: .173},
              {x: 'Rape', y: .215},
              {x: 'Shooting', y: .306},
              {x: 'Robbery', y: 4.213},
              {x: 'Auto Theft', y: 4.357},
              {x: 'Burglary', y: 6.520},
              {x: 'Assault', y: 9.703},
              {x: 'Larceny', y: 12.801}
            ]}
          />
          <VerticalBarSeries
            cluster="Southwestern"
            color="#673AB7"
            data={[
              {x: 'Arson', y: .084},
              {x: 'Homicide', y: .088},
              {x: 'Rape', y: .162},
              {x: 'Shooting', y: .172},
              {x: 'Robbery', y: 4.307},
              {x: 'Auto Theft', y: 2.383},
              {x: 'Burglary', y: 4.909},
              {x: 'Assault', y: 8.426},
              {x: 'Larceny', y: 16.031}
            ]}
          />
          <VerticalBarSeries
            cluster="Southern"
            color="#9E9E9E"
            data={[
              {x: 'Arson', y: .154},
              {x: 'Homicide', y: .131},
              {x: 'Rape', y: .192},
              {x: 'Shooting', y: .340},
              {x: 'Robbery', y: 3.131},
              {x: 'Auto Theft', y: 2.542},
              {x: 'Burglary', y: 4.872},
              {x: 'Assault', y: 7.799},
              {x: 'Larceny', y: 10.137}
            ]}
          />
          <VerticalBarSeries
            cluster="Central"
            color="#4CAF50"
            data={[
              {x: 'Arson', y: .063},
              {x: 'Homicide', y: .090},
              {x: 'Rape', y: .187},
              {x: 'Shooting', y: .192},
              {x: 'Robbery', y: 3.467},
              {x: 'Auto Theft', y: 1.455},
              {x: 'Burglary', y: 2.786},
              {x: 'Assault', y: 7.503},
              {x: 'Larceny', y: 12.767}
            ]}
          />
          <VerticalBarSeries
            cluster="Northern"
            color="#7CB5D2"
            data={[
              {x: 'Arson', y: .105},
              {x: 'Homicide', y: .094},
              {x: 'Rape', y: .180},
              {x: 'Shooting', y: .197},
              {x: 'Robbery', y: 3.147},
              {x: 'Auto Theft', y: 2.242},
              {x: 'Burglary', y: 5.114},
              {x: 'Assault', y: 5.784},
              {x: 'Larceny', y: 11.582}
            ]}
          />
          <VerticalBarSeries
            cluster="Southwestern"
            color="#FFEB3B"
            data={[
              {x: 'Arson', y: .162},
              {x: 'Homicide', y: .199},
              {x: 'Rape', y: .179},
              {x: 'Shooting', y: .408},
              {x: 'Robbery', y: 2.258},
              {x: 'Auto Theft', y: 2.893},
              {x: 'Burglary', y: 4.160},
              {x: 'Assault', y: 7.735},
              {x: 'Larceny', y: 7.607}
            ]}
          />
          <VerticalBarSeries
            cluster="NorthEastern"
            color="#795548"
            data={[
              {x: 'Arson', y: .168},
              {x: 'Homicide', y: .174},
              {x: 'Rape', y: .160},
              {x: 'Shooting', y: .329},
              {x: 'Robbery', y: 2.662},
              {x: 'Auto Theft', y: 3.042},
              {x: 'Burglary', y: 4.012},
              {x: 'Assault', y: 6.387},
              {x: 'Larceny', y: 8.172}
            ]}
          />
          <VerticalBarSeries
            cluster="Eastern"
            color="#FF5722"
            data={[
              {x: 'Arson', y: .120},
              {x: 'Homicide', y: .207},
              {x: 'Rape', y: .163},
              {x: 'Shooting', y: .424},
              {x: 'Robbery', y: 2.123},
              {x: 'Auto Theft', y: 1.665},
              {x: 'Burglary', y: 2.804},
              {x: 'Assault', y: 7.743},
              {x: 'Larceny', y: 6.725}
            ]}
          />
          <VerticalBarSeries
            cluster="Western"
            color="#3F51B5"
            data={[
              {x: 'Arson', y: .109},
              {x: 'Homicide', y: .237},
              {x: 'Rape', y: .142},
              {x: 'Shooting', y: .500},
              {x: 'Robbery', y: 1.877},
              {x: 'Auto Theft', y: 2.250},
              {x: 'Burglary', y: 2.636},
              {x: 'Assault', y: 7.169},
              {x: 'Larceny', y: 5.197}
            ]}
          />
        </XYPlot>
      </div>

      <div id="area-chart" className="graph">
      <h1 id="area-chart-title">Weapons Used in Each District</h1>
        <XYPlot

          // will eventually be solely in CSS file
          width={400}
          height={300}
          // ********************************************* //

          xDomain={[0, 10]}
          yDomain={[0, 10]}
        >
        <DiscreteColorLegend
          style={{fontSize: 11, position: 'absolute', left: '340px', top: '230px', color: '#000'}}
          orientation="horizontal"
          items={[
            {title: 'Firearms', color:'#86bbd8'},
            {title: 'Other', color:'#f6ae2d'},
            {title: 'Knife', color:'#758e4f'},
            {title: 'Hands', color:'#f26419'}
          ]}
        />
        <ArcSeries
          animation
          colorType={'literal'}
          center={{x: 4, y: 4.5}}
          data={this.state.weaponData.map(row => {
            if (this.state.value && this.state.value.color === row.color){
              return {...row, style: {fill: '#a1a1a1'}};
            }
            return row;
          })}
          onValueMouseOver={row => this.setState({value: row})}
          onSeriesMouseOut={() => this.setState({value: false})}
          style={{stroke: '#fff', strokeWidth: 3}}
        >
          {value !== false && <Hint value={value.name}/>}
        </ArcSeries>
        </XYPlot>
      </div>

      <div id="line-chart" className="graph">
      <h1 id="line-chart-title">All Crimes throughout the Year</h1>
        <XYPlot

          // will eventually be solely in CSS
          width={1200}
          height={250}
          // ********************************************* //
          xType="linear"
        >
        <XAxis
          tickValues={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
          tickFormat={d => ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d]}
        />
        <YAxis
          tickValues={[200, 400, 600, 800]}
          title="Amount of Crimes (thousands)"
          style={{fontSize: 11}}
        />
        <HorizontalGridLines />
        <VerticalGridLines />
        <LineSeries
          strokeStyle={'solid'}
          strokeWidth={2}
          data={this.state.timeData}
          style={{fill: '#fff'}}
        />
        </XYPlot>
      </div>

      </div>
    )
  }
}

export default Graphs;
