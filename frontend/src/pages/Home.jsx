import React from 'react'
import Navbar from '../componenets/Navbar'
import Hero from '../componenets/Hero'
import Featured from '../componenets/Featured'
import Contact from '../componenets/Contact'
import Footer from '../componenets/Footer'
import { Element } from 'react-scroll'

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
      <Element name='contact'>
        <Contact />
      </Element>



      <Footer />
    </div>

  )
}

export default Home