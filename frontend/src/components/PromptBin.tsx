import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import React from 'react';



interface Message {
  id: number;
  text: string;
  sender: 'user' | 'llm';
}

const PromptBin = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim() === '') return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');

    // Simulate LLM response
    setTimeout(() => {
      const llmResponse: Message = {
        id: Date.now() + 1, // Ensure unique ID
        text: 'Hi, im under construction right now! Come back soon tho :)',
        sender: 'llm',
      };
      setMessages((prevMessages) => [...prevMessages, llmResponse]);
    }, 1000);
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', boxSizing: 'border-box', minHeight: 0 }}>
      <div className="promptbin-chat-area" style={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', marginBottom: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: '10px',
              padding: '8px 12px',
              borderRadius: '18px',
              maxWidth: '70%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user' ? '#444' : '#FFFFFF',
              color: msg.sender === 'user' ? 'white' : 'black',
              marginLeft: msg.sender === 'user' ? 'auto' : '0',
              marginRight: msg.sender === 'llm' ? 'auto' : '0',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInputValue(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => e.key === 'Enter' && handleSend()}
          placeholder="Create your masterpiece...."
          sx={{
            flexGrow: 1,
            marginRight: '10px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '5px',
              '& fieldset': {
                borderColor: '#ccc',
              },
              '&:hover fieldset': {
                borderColor: '#bbb',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#800080', // Purple highlight color
                boxShadow: '0 0 8px 2px rgba(128, 0, 128, 0.3)', // Purple outer glow and shadow
              },
            },
            // Ensure input text area has appropriate padding if default isn't enough
            '& .MuiInputBase-input': {
              padding: '10px 14px', // Match original input padding more closely
              color: 'white', // Set typed text color to white
              fontFamily: 'Inter, sans-serif',
            },
            // Change placeholder color
            '& ::placeholder': {
              color: '#a9a9a9', // Darker grey for placeholder
              opacity: 1, // Ensure placeholder is visible
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          sx={{
            padding: '10px 15px',
            borderRadius: '5px',
            backgroundColor: '#282828',
            color: 'white',
            '&:hover': {
              backgroundColor: '#1e1e1e',
            },
            // Setting minHeight and height to ensure button aligns well with TextField
            minHeight: '44px', // Adjust as needed based on TextField height
            height: '44px',    // Adjust as needed
          }}
        >
          Send
        </Button>
      </div>
    </main>
  )
}

export default PromptBin