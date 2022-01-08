import api from "../api";
import {useEffect, useState} from "react";


interface OwnProps {
  isLoggedIn: boolean;
  setIsLoggedIn: () =>{};
}

const Login: React.FC<OwnProps> = (props) => {
  const {isLoggedIn, setIsLoggedIn} = props;

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const postLogin = async (e) => {
    e.preventDefault();
    const loginResponse = await api.post('/api/users/login', { email: email, password: password })
    localStorage.setItem('token', loginResponse.data.token);
    localStorage.setItem('refreshtoken', loginResponse.data.refreshtoken);
    setIsLoggedIn(true)
  }

  const postLogout   = async (e) => {
    e.preventDefault();
    localStorage.setItem('token', "");
    localStorage.setItem('refreshtoken', "");
    setIsLoggedIn(false)
  }

  useEffect( () => {

    (async () => {
      const resp = await api.get('/api/users/me');
      if (resp.data) {
        setIsLoggedIn(true)
      }
    })()
  }, [setIsLoggedIn]);

  return (
  <>
  {!isLoggedIn &&
    <form>
      <input name={"email"} value={email} onChange={(e) => setEmail(e.target.value)}/>
      <input name={"password"} value={password} onChange={(e) => setPassword(e.target.value)} type={"Password"} />
      <input type={"submit"} value={"Login"} onClick={postLogin}/>
    </form>
  }
  {isLoggedIn &&
    <form>
      <input type={"submit"} value={"Logout"} onClick={postLogout}/>
    </form>}
  </>
  );

}
export default Login;
