import React, { useState } from 'react';
import easySoapRequest from 'easy-soap-request'; 
import './services.css';

const GetAccountDetails = () => {
  const [email, setEmail] = useState('');
  const [accountDetails, setAccountDetails] = useState(null); 
  const [message, setMessage] = useState(''); 

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const xmlBody = createSOAPRequest(email);

      const options = {
        url: 'http://localhost:8000/account/soap', 
        xml: xmlBody, 
        headers: {
          'Content-Type': 'text/xml', 
        },
      };

      const { response } = await easySoapRequest(options);
      console.log('SOAP Response Body:', response.body);

      const responseMessage = response.body; 
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(responseMessage, 'text/xml');
    
      // Access the correct namespace (tns and s0)
      const resultNode = xmlDoc.getElementsByTagNameNS('http://schemas.xmlsoap.org/soap/envelope/', 'Body')[0]
        .getElementsByTagNameNS('bank.soap', 'get_account_detailsResult')[0];

      // Extract the result if available
      if (resultNode) {
        const rib = resultNode.getElementsByTagNameNS('account_app.complexTypes', 'rib')[0]?.textContent;
        const balance = resultNode.getElementsByTagNameNS('account_app.complexTypes', 'balance')[0]?.textContent;
        const creationDate = resultNode.getElementsByTagNameNS('account_app.complexTypes', 'creationDate')[0]?.textContent;

        setAccountDetails({
          rib,
          balance,
          creationDate,
        });
      } else {
        setMessage('No account details found.');
      }
    } catch (error) {
      setMessage('An error occurred while retrieving the account details.');
      console.error('Error:', error);
    }
  };

  const createSOAPRequest = (email) => {
    return `
    <x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/"
                xmlns:ban="bank.soap">
      <x:Header/>
      <x:Body>
        <ban:get_account_details>
          <ban:email>${email}</ban:email>
        </ban:get_account_details>
      </x:Body>
    </x:Envelope>
    `;
  };

  return (
    <div className="form-container">
      <h2>Get Account Details</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Client Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Get Account Details</button>
      </form>

      {message && <p className={message.includes('error') ? 'error' : 'success'}>{message}</p>} 
      
      {accountDetails && (
        <div className="account-details">
          <div className="account-item">
            <strong>RIB:</strong> <span>{accountDetails.rib}</span>
          </div>
          <div className="account-item">
            <strong>Balance:</strong> <span>{accountDetails.balance}</span>
          </div>
          <div className="account-item">
            <strong>Creation Date:</strong> <span>{accountDetails.creationDate}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAccountDetails;
