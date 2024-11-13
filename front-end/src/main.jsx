import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AddClient from './services/AddClient.jsx';
import AddAccount from './services/AddAccount.jsx';
import GetAccountDetails from './services/GetAccDetails.jsx';
import GetAllAccounts from './services/GetAllAccounts.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/add-client" element={<AddClient />} />
      <Route path='/add-account' element={<AddAccount/>} />
      <Route path='/get-account-details' element={<GetAccountDetails/>} />
      <Route path='/get-all-accounts' element={<GetAllAccounts  />} />
    </Routes>
  </BrowserRouter>
)
