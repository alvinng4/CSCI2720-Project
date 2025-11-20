import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';


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
      </div>
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
