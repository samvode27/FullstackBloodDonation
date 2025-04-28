import React from 'react'
import Navbar from '../componenets/Navbar'
import Hero from '../componenets/Hero'
import Featured from '../componenets/Featured'
import Footer from '../componenets/Footer'
import { Element } from 'react-scroll'
import Process from '../componenets/Process'

const Home = () => {
  return (
    <div>
      <Navbar />
      <Element name='hero'>
        <Hero />
      </Element>
      <Element name='featured'>
        <Featured />
      </Element>
      <Element name='process'>
        <Process />
      </Element>
      <Element name='footer'>
        <Footer />
      </Element>
    </div>

  )
}

export default Home