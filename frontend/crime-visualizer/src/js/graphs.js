import {
    XYPlot,
    XAxis,
    YAxis,
    VerticalGridLines,
    HorizontalGridLines,
    VerticalBarSeries,
    DiscreteColorLegend,
  } from 'react-vis';
import React, {Component} from 'react';

class Graphs extends Component{
  constructor(props){
    super(props);

    this.state = {
      data: [],
    }
  }

  render(){
    return(
      <div>
      <XYPlot
          className="clustered-stacked-bar-chart-example"
          xType="ordinal"
          width={800}
          height={500}
          style={{
            position: 'absolute',
            marginTop: '20px',
            marginLeft: '60px',
            border: '1px solid black',
            padding: '10px',
            boxSizing: 'content-box'
          }}
        >
          <DiscreteColorLegend
            style={{position: 'absolute', marginLeft: '750px', marginTop: '60px'}}
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
            tickValues={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]}
            tickFormat={d => ['0','1000','2000','3000', '4000', '5000', '6000', '7000', '8000', '90000', '10000', '11000', '12000', '13000', '14000', '15000', '16000'][d]}
          />
          <VerticalBarSeries
            cluster="Northwestern"
            color="#F44336"
            data={[
              {x: 'Larceny', y: 12801},
              {x: 'Assault', y: 9703},
              {x: 'Burglary', y: 6520},
              {x: 'Auto Theft', y: 4357},
              {x: 'Robbery', y: 4213},
              {x: 'Shooting', y: 306},
              {x: 'Rape', y: 215},
              {x: 'Homicide', y: 173},
              {x: 'Arson', y: 221}
            ]}
          />
          <VerticalBarSeries
            cluster="Southwestern"
            color="#673AB7"
            data={[
              {x: 'Larceny', y: 16031},
              {x: 'Assault', y: 8426},
              {x: 'Burglary', y: 4909},
              {x: 'Auto Theft', y: 2383},
              {x: 'Robbery', y: 4307},
              {x: 'Shooting', y: 172},
              {x: 'Rape', y: 162},
              {x: 'Homicide', y: 88},
              {x: 'Arson', y: 84}
            ]}
          />
          <VerticalBarSeries
            cluster="Southern"
            color="#9E9E9E"
            data={[
              {x: 'Larceny', y: 10137},
              {x: 'Assault', y: 7799},
              {x: 'Burglary', y: 4872},
              {x: 'Auto Theft', y: 2542},
              {x: 'Robbery', y: 3131},
              {x: 'Shooting', y: 340},
              {x: 'Rape', y: 192},
              {x: 'Homicide', y: 131},
              {x: 'Arson', y: 154}
            ]}
          />
          <VerticalBarSeries
            cluster="Central"
            color="#4CAF50"
            data={[
              {x: 'Larceny', y: 12767},
              {x: 'Assault', y: 7503},
              {x: 'Burglary', y: 2786},
              {x: 'Auto Theft', y: 1455},
              {x: 'Robbery', y: 3467},
              {x: 'Shooting', y: 192},
              {x: 'Rape', y: 187},
              {x: 'Homicide', y: 90},
              {x: 'Arson', y: 63}
            ]}
          />
          <VerticalBarSeries
            cluster="Northern"
            color="#7CB5D2"
            data={[
              {x: 'Larceny', y: 11582},
              {x: 'Assault', y: 5784},
              {x: 'Burglary', y: 5114},
              {x: 'Auto Theft', y: 2242},
              {x: 'Robbery', y: 3147},
              {x: 'Shooting', y: 197},
              {x: 'Rape', y: 180},
              {x: 'Homicide', y: 94},
              {x: 'Arson', y: 105}
            ]}
          />
          <VerticalBarSeries
            cluster="Southwestern"
            color="#FFEB3B"
            data={[
              {x: 'Larceny', y: 7607},
              {x: 'Assault', y: 7735},
              {x: 'Burglary', y: 4160},
              {x: 'Auto Theft', y: 2893},
              {x: 'Robbery', y: 2258},
              {x: 'Shooting', y: 408},
              {x: 'Rape', y: 179},
              {x: 'Homicide', y: 199},
              {x: 'Arson', y: 162}
            ]}
          />
          <VerticalBarSeries
            cluster="NorthEastern"
            color="#795548"
            data={[
              {x: 'Larceny', y: 8172},
              {x: 'Assault', y: 6387},
              {x: 'Burglary', y: 4012},
              {x: 'Auto Theft', y: 3042},
              {x: 'Robbery', y: 2662},
              {x: 'Shooting', y: 329},
              {x: 'Rape', y: 160},
              {x: 'Homicide', y: 174},
              {x: 'Arson', y: 168}
            ]}
          />
          <VerticalBarSeries
            cluster="Eastern"
            color="#FF5722"
            data={[
              {x: 'Larceny', y: 6725},
              {x: 'Assault', y: 7743},
              {x: 'Burglary', y: 2804},
              {x: 'Auto Theft', y: 1665},
              {x: 'Robbery', y: 2123},
              {x: 'Shooting', y: 424},
              {x: 'Rape', y: 163},
              {x: 'Homicide', y: 207},
              {x: 'Arson', y: 120}
            ]}
          />
          <VerticalBarSeries
            cluster="Western"
            color="#3F51B5"
            data={[
              {x: 'Larceny', y: 5197},
              {x: 'Assault', y: 7169},
              {x: 'Burglary', y: 2636},
              {x: 'Auto Theft', y: 2250},
              {x: 'Robbery', y: 1877},
              {x: 'Shooting', y: 500},
              {x: 'Rape', y: 142},
              {x: 'Homicide', y: 237},
              {x: 'Arson', y: 109}
            ]}
          />
        </XYPlot>
        </div>
    )
  }
}

export default Graphs;
