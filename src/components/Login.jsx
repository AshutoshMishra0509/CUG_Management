import "./Login.css";
import logo from "../assets/railwaylogo.png";
import { LuUser2 } from "react-icons/lu";
import { MdOutlineEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { userContext } from "../App.jsx";
// import { setMode } from "../userState.jsx";
import Fapp from "../firebase";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
// import { useAuth } from "../Routing/AuthContext";
const Login = () => {
  const { userType, setUserType } = useContext(userContext);
  // -----------------------------
  const [user, setuser] = useState("Dealer");
  const db = getFirestore(Fapp);
  const navigate = useNavigate();
  function handleDealer() {
    setError("");
    setuser("Dealer");
  }
  function handleAdmin() {
    setuser("Admin");
    setError("");
  }
  // --------------------------------------
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // const handleDealer = () => setuser("Dealer");
  // const handleAdmin = () => setuser("Admin");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name === "" || email === "" || password === "") {
      alert("please Enter all the Fields");
      return;
    }
    try {
      const collectionName = user === "Dealer" ? "dealers" : "admin";
      const q = query(
        collection(db, collectionName),
        where(`${user}_Name`, "==", name),
        where(`${user}_Email`, "==", email),
        where(`${user}_Password`, "==", password)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        localStorage.setItem("user", JSON.stringify(userData));
        setUserType(true);
        if (user === "Dealer") navigate("/dealer/homePage");
        else navigate("/admin/homePage");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Error while logging in");
      console.error(err);
    }

    // console.log("Clicked");
    // if (user === "Dealer") {
    // if (user === "Dealer") {
    // if (user === "Dealer") {
    // if (user === "Dealer") {
    //   navigate("/dealer/homePage");
    // } else {
    //   navigate("/admin/homePage");
    // }
  };
  return (
    <>
      <main className="login">
        <header className="login_header">
          <img src={logo} alt="Railway_logo" className="logo" />
        </header>
        <center>
          <h1>Login</h1>
        </center>
        <div className="form">
          <form action="" className="login_form">
            {error && <p className="error">{error}</p>}
            <div className="select_user">
              <button
                className={` ${user === "Dealer" ? "dealer" : ""} `}
                onClick={handleDealer}
                type="button"
              >
                Dealer
              </button>
              <button
                className={` ${user === "Admin" ? "admin" : ""} `}
                onClick={handleAdmin}
                type="button"
              >
                Admin{" "}
              </button>
            </div>
            <div className="user_name">
              Name:
              <input
                type="text"
                className="loginname"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <LuUser2 className="userlogo" />
            </div>
            <div className="user_email">
              Email:
              <input
                type="email"
                className="loginemail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <MdOutlineEmail className="userlogo" />
            </div>
            <div className="user_password">
              Password:
              <input
                type="password"
                className="loginpass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FaLock className="userlogo" />
            </div>
            <button className="submit" onClick={(e) => handleSubmit(e)}>
              Login
            </button>
          </form>
        </div>
      </main>
      <Outlet />
    </>
  );
};
export default Login;
