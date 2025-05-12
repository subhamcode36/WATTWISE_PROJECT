import React, { useState } from "react";
import { Typography, Container, Grid } from "@mui/material";

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="bg-blue-900 min-h-screen flex flex-col items-center justify-center text-white relative">
        <Container className="bg-teal-500 rounded-2xl p-10 text-center shadow-lg mb-5">
          <Typography
            variant="h3"
            className="font-sans font-semibold mb-5 text-blue-900"
          >
            Welcome to WattWise
          </Typography>
          <Typography variant="body1" className="mb-5 opacity-90 text-black">
            Introducing &quot;WattWise&quot; - your go-to energy dashboard for
            BITS Goa. With WattWise, you can easily track how much energy
            we&apos;re using across campus. It helps everyone at BITS Goa save
            energy and keep our campus green. Let&apos;s make BITS Goa brighter
            and more sustainable together with WattWise!
          </Typography>
          <button
            href="/dashboard"
            className="rounded-lg py-3 px-6 font-semibold text-lg tracking-wide uppercase bg-blue-900 text-white hover:bg-teal-400"
          >
            Get Started
          </button>
        </Container>
        <footer className="bg-teal-700 p-5 text-white w-full text-center absolute bottom-0 left-0">
          <Container maxWidth="md">
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" align="center">
                  Email: mkd@goa.bits-pilani.ac.in
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" align="center">
                  Contact Number: +91 942 239 0888
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </footer>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-5 right-5 bg-gray-800 text-white p-2 rounded"
        >
          Toggle Dark Mode
        </button>
      </div>
    </div>
  );
};

export default Home;
