import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import HighlightsModule from '../components/HighlightsModule'
import HeroBanner from '../components/Hero'

const Home = () => {
  return (
    <>
    <div className='bg-primary-green-dark'>
      <Header />
      <HeroBanner />
      <HighlightsModule />
      <Footer />
    </div>
    </>
  )
}

export default Home

