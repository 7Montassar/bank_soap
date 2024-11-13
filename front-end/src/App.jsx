import { Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="container">
      <h1 className="title">SOAP Services</h1>
      <div className="service-grid">
        <Link to="/add-client" className="service-box">
          <div className="service-name">Add Client</div>
        </Link>

        <Link to="/add-account" className="service-box">
          <div className="service-name">Add Account</div>
        </Link>

        <Link to="/deposit" className="service-box">
          <div className="service-name">Deposit</div>
        </Link>

        <Link to="/withdraw" className="service-box">
          <div className="service-name">Withdraw</div>
        </Link>

        <Link to="/transfer" className="service-box">
          <div className="service-name">Transfer</div>
        </Link>

        <Link to="/get-account-details" className="service-box">
          <div className="service-name">Get Acc Details</div>
        </Link>

        <Link to="/get-all-accounts" className="service-box">
          <div className="service-name">Get All Accounts</div>
        </Link>
      </div>
    </div>
  );
}

export default App;
