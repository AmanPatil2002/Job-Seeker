import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Home from "./Pages/Home";
import AboutUs from "./Pages/AboutUs";
import Contact from "./Pages/Contact";
import Account from "./Pages/Account";
import MyApplication from "./Pages/MyApplication"

import Employee from "./Pages/Employee";
import Dashboard from "./Mycomponent/Dashboard";
import PostJobs from "./Mycomponent/PostJob";
import ViewApplicantion from "./Mycomponent/ViewApplicantion";
import ViewJob from "./Mycomponent/ViewJob";
import ViewUser from "./Mycomponent/ViewUser";
import Layout from "./Layout";
import Site from "./Pages/Site";
import ProtectedRoutes from "./utils/ProtectedRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Site />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoutes />}>
          {/* ================= EMPLOYEE SECTION ================= */}
          <Route path="/employee" element={<Employee />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="post-jobs" element={<PostJobs />} />
            <Route path="applications" element={<ViewApplicantion />} />
            <Route path="users" element={<ViewUser />} />
            <Route path="jobs" element={<ViewJob />} />
          </Route>
          {/* ================= USER SECTION ================= */}
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/account" element={<Account />} />
            <Route path="/myapplication" element={<MyApplication />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
