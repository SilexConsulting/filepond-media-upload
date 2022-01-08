import React, {useEffect,  useState} from 'react';
import './App.css';
import S3FilePond from './componenets/media/S3FilePond';
import Login from './componenets/Login';
import api from './api';
import DemoForm from './componenets/forms/DemoForm';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect( () => {
    (async () => {
      const resp = await api.get('/api/users/me');
      if (resp.data) {
        setIsLoggedIn(true);
      }
    })();
  }, []);


  return (
    <div className="App">
      <Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
      {isLoggedIn && <>
          <DemoForm/>
      </>}
    </div>
  );
}

export default App;
