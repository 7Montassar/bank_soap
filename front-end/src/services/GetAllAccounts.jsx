import React, { useState } from 'react';
import easySoapRequest from 'easy-soap-request';
import './services.css';

const GetAllAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const xmlBody = createSOAPRequest();
      
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
      
      const accountsNodes = xmlDoc.getElementsByTagName('tns:get_all_accountsResult')[0]?.childNodes;

      if (accountsNodes && accountsNodes.length > 0) {
        const accountList = Array.from(accountsNodes).map((accountNode) => {
          const rib = accountNode.getElementsByTagName('s0:rib')[0]?.textContent;
          const balance = accountNode.getElementsByTagName('s0:balance')[0]?.textContent;
          const creationDate = accountNode.getElementsByTagName('s0:creationDate')[0]?.textContent;

          if (rib && balance && creationDate) {
            return { rib, balance, creationDate };
          }
          return null;
        }).filter(Boolean); 

        if (accountList.length > 0) {
          setAccounts(accountList);
        } else {
          setMessage('No accounts found.');
        }
      } else {
        setMessage('No accounts found.');
      }
    } catch (error) {
      setMessage('An error occurred while retrieving the accounts.');
      console.error('Error:', error);
    }
  };

  const createSOAPRequest = () => {
    return `
    <x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/"
                xmlns:tns="bank.soap"
                xmlns:s0="account_app.complexTypes">
      <x:Header/>
      <x:Body>
        <tns:get_all_accounts></tns:get_all_accounts>
      </x:Body>
    </x:Envelope>
    `;
  };

  return (
    <div className="form-container">
      <h2>Get All Accounts</h2>
      <form onSubmit={handleSubmit}>
        <button type="submit">Get All Accounts</button>
      </form>

      {message && <p className={message.includes('error') ? 'error' : 'success'}>{message}</p>}

      {accounts.length > 0 && (
        <div className="accounts-list">
          {accounts.map((account, index) => (
            <div key={index} className="account-item">
              <p><strong>RIB:</strong> {account.rib}</p>
              <p><strong>Balance:</strong> {account.balance}</p>
              <p><strong>Creation Date:</strong> {account.creationDate}</p>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GetAllAccounts;
