import React from 'react'
import NavBar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Deals from '../components/Deals'
import Popular from '../components/Popular'
import Cta from '../components/CTA'
import Footer from '../components/Footer'
import Testimonials from '../components/Testimonials'
import { ToastContainer, toast } from 'react-toastify';

const home = () => {
  return (
    <div>
      <ToastContainer />
      <NavBar />
      <Hero />
      <Features />
      <Deals />
      <Popular />
      <Testimonials />
      <Cta />
      <Footer />
    </div>
  )
}

export default home
