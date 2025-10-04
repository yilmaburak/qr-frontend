import React from 'react'

const Footer = () => {
    return (
        <footer className="bg-[#0A0A0A] text-white p-4 text-center">
            &copy; {new Date().getFullYear()} HellalQR. All rights reserved.
        </footer>
    )
}

export default Footer