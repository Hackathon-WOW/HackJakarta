"use client"

import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import { createClient } from '@/utils/supabase/client'

const Home = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  return (
    <>
      <Header User={user}/>
    </>
  )
}

export default Home