import { Outlet } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const PublicLayout = () => {
    return (
        <div className="flex flex-col min-h-dvh bg-black text-white">
            <Header />
            <Outlet />
            <Footer />
        </div>
    )
}

export default PublicLayout