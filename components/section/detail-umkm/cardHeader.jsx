import React from 'react'

const CardHeader = (props) => {
  return (
    <>
        <div className="flex items-center justify-between text-accent-black text-2xl font-bold text-center">
            <h2>{props.title}</h2>
        </div>
    </>
  )
}

export default CardHeader