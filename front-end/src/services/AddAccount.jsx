import React, { useState } from 'react';
import easySoapRequest from 'easy-soap-request'; 
import './services.css';

const AddAccount = () => {
  const [rib, setRib] = useState('');
  const [balance, setBalance] = useState('0');
  const [cin, setCin] = useState('');
  const [name, setName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isNewClient, setIsNewClient] = useState(false); // Flag to check if the user is adding a new client

  const handleSubmit = async (event) => {
    event.preventDefault();

    const accountData = {
      rib,
      balance,
      cin,
      name,
      familyName,
      email,
    };

    try {
      const xmlBody = createSOAPRequest(accountData);

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
      const result = xmlDoc.getElementsByTagName('tns:add_accountResult')[0]?.textContent;
      setMessage(result || 'Account added successfully!');
    } catch (error) {
      setMessage('An error occurred while adding the account.');
      console.error('Error:', error);
    }
  };

  const createSOAPRequest = (accountData) => {
    const creationDate = new Date().toISOString().split('T')[0];

    return `
      <x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ban="bank.soap"
                  xmlns:acc="account_app.complexTypes">
        <x:Header/>
        <x:Body>
          <ban:add_account>
            <ban:account>
              <acc:rib>${accountData.rib}</acc:rib>
              <acc:client>
                <acc:cin>${accountData.cin}</acc:cin>
                ${accountData.name && accountData.familyName && accountData.email ? `
                  <acc:name>${accountData.name}</acc:name>
                  <acc:familyName>${accountData.familyName}</acc:familyName>
                  <acc:email>${accountData.email}</acc:email>
                ` : ''}
              </acc:client>
              <acc:balance>${accountData.balance}</acc:balance>
              <acc:AccountType>?</acc:AccountType>
              <acc:creationDate>${creationDate}</acc:creationDate>
            </ban:account>
          </ban:add_account>
        </x:Body>
      </x:Envelope>
    `;
  };

  return (
    <div className="form-container">
      <h2>Add New Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="rib">RIB:</label>
          <input
            type="text"
            id="rib"
            value={rib}
            onChange={(e) => setRib(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="balance">Balance:</label>
          <input
            type="number"
            id="balance"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="cin">Client CIN:</label>
          <input
            type="text"
            id="cin"
            value={cin}
            onChange={(e) => setCin(e.target.value)}
            required
          />
        </div>

        {/* Toggle between adding a new client or using existing client */}
        <div>
          <label>
            <input
              type="checkbox"
              checked={isNewClient}
              onChange={() => setIsNewClient(!isNewClient)}
            />
            Add a new client
          </label>
        </div>

        {isNewClient && (
          <>
            <div>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isNewClient}
              />
            </div>
            <div>
              <label htmlFor="familyName">Family Name:</label>
              <input
                type="text"
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required={isNewClient}
              />
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={isNewClient}
              />
            </div>
          </>
        )}

        <button type="submit">Add Account</button>
      </form>

      {message && <p className={message.includes('error') ? 'error' : 'success'}>{message}</p>} 
    </div>
  );
};

export default AddAccount;
