import React, {useEffect,  useState} from 'react';
import './App.css';
import S3FilePond from './componenets/media/S3FilePond';
import Login from './componenets/Login';
import api from './api';
import DemoForm from './componenets/forms/DemoForm';

function App() {
  const API_ENDPOINT = '/api/media/getUrlForFileUpload';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const url = `https://s3-media-upload-globalimpact-world.s3-accelerate.amazonaws.com/uat/39f87176-9391-40d3-bfbd-4c72d0541c27`
  const initialFiles = [{
    source: url,
    options: {
      type: "local"
    }
  }];


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
          <S3FilePond imageCropAspectRatio={0} presignedUrlEndpoint={API_ENDPOINT} initialFiles={initialFiles}/>
          <DemoForm/>
      </>}
    </div>
  );
}

export default App;
