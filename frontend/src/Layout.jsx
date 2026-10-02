import { Outlet } from "react-router-dom";
import Header from "./Mycomponent/Header";
import Footer from "./Mycomponent/Footer";

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default Layout;