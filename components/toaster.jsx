import React from 'react'
import { Toaster } from 'react-hot-toast'

const ToasterStyle = () => {
  return (
    <>
        <Toaster position='top-right' gutter={3}
            toastOptions={{
                success: {
                    style: {
                    border: '1px solid #52D689',
                    background: '#C7DDB5'
                    },
                },
                error: {
                    style: {
                    border: '1px solid #F97072',
                    background: '#FECACA'
                    },
                },
            }}
        />
    </>
  )
}

export default ToasterStyle