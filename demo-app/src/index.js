import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';


let locationData = [
    {id: 1, location:"location1", distance: 61, noOfEvents: 3}, 
    {id: 2, location:"location2", distance: 13, noOfEvents: 4}, 
    {id: 3, location:"location3", distance: 71, noOfEvents: 6}, 
];

class App extends React.Component {
  render() {
    return (
      <Navigation/>
    );
  }
}

class Home extends React.Component {
  render() {
    return (
      <div className='body'>
        <h2>Home</h2>
      </div>
    );
  }
}

class LocationList extends React.Component {
  render() {
    return (
      <div className='body'>
        <h2>LocationList</h2>
        <div className='locationCardsTitle'>
          <table>
            <tr>
              <th style={{width: "140px"}}>
                <div>ID</div>
              </th>
              <th style={{width: "240px"}}>
                <div>Location</div>
              </th>
              <th style={{width: "140px"}}>
                <div>DISTANCE</div>
              </th>
              <th style={{width: "240px"}}>
                <div>NUMBER OF EVENTS</div>
              </th>
              <th style={{width: "240px"}}>
                <div>Add to favourite</div>
              </th>
            </tr>
          </table>
        </div>
        
        <div className='locationCardsTable'>
          <>
            {locationData.map((file,index) => <LocationCard i={index} key={index}/>)}
          </>
        </div>
        
      </div>
    );
  }
}


    
class LocationCard extends React.Component{
    // Add your code here
    // Use Bootstrap cards
    render() {
        let i = this.props.i;
        return (
            // change data[0] to data[i]
        <>
          <hr />
          <div>
            <table className='locationCards'>
              <tr>
                <th style={{width: "140px"}}>
                  <div>{locationData[i].id}</div>
                </th>
                <th style={{width: "240px"}}>
                  <div className='locationNameBoxes'>{locationData[i].location}</div>
                </th>
                <th style={{width: "140px"}}>
                  <div>{locationData[i].distance} km</div>
                </th>
                <th style={{width: "240px"}}>
                  <div>{locationData[i++].noOfEvents}</div>
                </th>
                <th style={{width: "240px"}}>
                  <button className='favouriteButton' >✓</button>
                </th>
              </tr>
            </table>
          </div>
        </>
        );
    }
}











class EventList extends React.Component {
  render() {
    return (
      <div className='body'>
        <h2>EventList</h2>
      </div>
    );
  }
}

class Map extends React.Component {
  render() {
    return (
      <div className='body'>
        <h2>Map</h2>
      </div>
    );
  }
}

class FavouriteList extends React.Component {
  render() {
    return (
      <div className='body'>
        <h2>FavouriteList</h2>
      </div>
    );
  }
}

class Suggestions extends React.Component {
  render() {
    return (
      <div className='body'>
        <h2>Suggestions</h2>
      </div>
    );
  }
}


class Navigation extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div className='navbar'>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/locationList">Location List</Link>
            </li>
            <li>
              <Link to="/eventList">Event List</Link>
            </li>
            <li>
              <Link to="/map">Map</Link>
            </li>
            <li>
              <Link to="/favouriteList">favourite list</Link>
            </li>
            <li>
              <Link to="/suggestions">No idea?</Link>
            </li>
          </ul>
        </div>



        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/locationList" element={<LocationList />} />
          <Route path="/eventList" element={<EventList />} />
          <Route path="/map" element={<Map />} />
          <Route path="/favouriteList" element={<FavouriteList />} />
          <Route path="/suggestions" element={<Suggestions />} />
        </Routes>
      </BrowserRouter>
    );
  }
}





const root = ReactDOM.createRoot(document.querySelector('#app'));
root.render(<App />);
