import React, { useState } from 'react';
import easySoapRequest from 'easy-soap-request'; 
import './services.css';

const AddClient = () => {
  const [cin, setCin] = useState('');
  const [name, setName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); 

  const handleSubmit = async (event) => {
    event.preventDefault();

    const clientData = {
      cin,
      name,
      familyName,
      email,
    };

    try {
      const xmlBody = createSOAPRequest(clientData);

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
      const result = xmlDoc.getElementsByTagName('tns:add_clientResult')[0]?.textContent;
      setMessage(result || 'Client added successfully!');
    } catch (error) {
      setMessage('An error occurred while adding the client.');
      console.error('Error:', error);
    }
  };

  const createSOAPRequest = (clientData) => {
    return `
    <x:Envelope
      xmlns:x="http://schemas.xmlsoap.org/soap/envelope/"
      xmlns:ban="bank.soap"
      xmlns:acc="account_app.complexTypes">
      <x:Header/>
      <x:Body>
        <ban:add_client>
            <ban:client>
                <acc:cin>${clientData.cin}</acc:cin>
                <acc:name>${clientData.name}</acc:name>
                <acc:familyName>${clientData.familyName}</acc:familyName>
                <acc:email>${clientData.email}</acc:email>
            </ban:client>
        </ban:add_client>
      </x:Body>
    </x:Envelope>
    `;
  };

  return (
    <div className="form-container">
      <h2>Add New Client</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="cin">CIN:</label>
          <input
            type="text"
            id="cin"
            value={cin}
            onChange={(e) => setCin(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="familyName">Family Name:</label>
          <input
            type="text"
            id="familyName"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Client</button>
      </form>

      {message && <p className={message.includes('error') ? 'error' : 'success'}>{message}</p>} 
    </div>
  );
};

export default AddClient;
