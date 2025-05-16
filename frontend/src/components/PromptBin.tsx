import { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import React from 'react';
import { Ollama } from "ollama";
import AddIcon from '@mui/icons-material/Add';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Popover from '@mui/material/Popover';
import DeleteIcon from '@mui/icons-material/Delete';
// import { Supermemory } from 'supermemory';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'llm';
}

interface Chat {
  id: number;
  title: string;
  messages: Message[];
}

const PromptBin = () => {
  const [chats, setChats] = useState<Chat[]>([{
    id: Date.now(),
    title: 'New Chat',
    messages: []
  }]);
  const [currentChatId, setCurrentChatId] = useState<number>(chats[0].id);
  const [inputValue, setInputValue] = useState('');
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const currentChat = chats.find(chat => chat.id === currentChatId) || chats[0];

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [currentChat.messages]);

  useEffect(() => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId && chat.title === 'New Chat' && chat.messages.length > 0) {
        const firstUserMsg = chat.messages.find(m => m.sender === 'user');
        if (firstUserMsg) {
          // Use first 6 words or less as title
          const words = firstUserMsg.text.split(' ').slice(0, 6).join(' ');
          return { ...chat, title: words + (firstUserMsg.text.split(' ').length > 6 ? '...' : '') };
        }
      }
      return chat;
    }));
  }, [currentChat.messages, currentChatId]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now(),
      title: 'New Chat',
      messages: []
    };
    setChats(prevChats => [...prevChats, newChat]);
    setCurrentChatId(newChat.id);
    setInputValue('');
  };

  const handleSend = async () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };

    setChats(prevChats => prevChats.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ));

    const currentInput = inputValue;
    setInputValue('');

    await getOllama(currentInput); // Call getOllama with the user's input
  };
  
  async function getOllama(userInput: string) {
    const ollama = new Ollama(); // Assuming Ollama is configured for your setup
    try {
      const responseStream = await ollama.chat({
        model: 'llama3.2:latest', // Ensure this model is available locally
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that can answer questions and help with tasks.'
          },
          {
            role: 'user',
            content: userInput
          }
        ],
        stream: true
      });

      let llmMessageId: number | null = null;
      let accumulatedText = "";

      for await (const part of responseStream) {
        if (part.message && typeof part.message.content === 'string') {
          if (llmMessageId === null) {
            llmMessageId = Date.now() + Math.random();
            accumulatedText = part.message.content;
            const newLlmMessage: Message = {
              id: llmMessageId,
              text: accumulatedText,
              sender: 'llm',
            };
            setChats(prevChats => prevChats.map(chat => 
              chat.id === currentChatId 
                ? { ...chat, messages: [...chat.messages, newLlmMessage] }
                : chat
            ));
          } else {
            accumulatedText += part.message.content;
            setChats(prevChats => prevChats.map(chat => 
              chat.id === currentChatId 
                ? { 
                    ...chat, 
                    messages: chat.messages.map(msg => 
                      msg.id === llmMessageId 
                        ? { ...msg, text: accumulatedText }
                        : msg
                    )
                  }
                : chat
            ));
          }
        }
      }
    } catch (error) {
      console.error("Error calling Ollama or processing stream:", error);
      const llmErrorResponse: Message = {
        id: Date.now() + 1,
        text: "Error: Failed to connect to Ollama or stream response. Check if Ollama is running and the model is available.",
        sender: 'llm',
      };
      setChats(prevChats => prevChats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, llmErrorResponse] }
          : chat
      ));
    }
  }

  // Popover handlers
  const handleChatButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const popoverOpen = Boolean(anchorEl);

  // Delete chat handler
  const handleDeleteChat = (chatId: number) => {
    if (chats.length === 1) return; // Prevent deleting the last chat
    setChats(prevChats => {
      const newChats = prevChats.filter(chat => chat.id !== chatId);
      // If the current chat is deleted, switch to the first available chat
      if (currentChatId === chatId && newChats.length > 0) {
        setCurrentChatId(newChats[0].id);
      }
      return newChats;
    });
  };

  return (
    <main style={{ display: 'flex', height: '100%', padding: '20px', boxSizing: 'border-box', minHeight: 0, position: 'relative' }}>
      {/* Compact Chat Switcher Button */}
      <div style={{ position: 'absolute', top: 10, right: 20, zIndex: 10 }}>
        <IconButton onClick={handleChatButtonClick} size="large" sx={{ background: '#222', color: 'white', '&:hover': { background: '#333' } }}>
          <ChatBubbleOutlineIcon />
        </IconButton>
        <Popover
          open={popoverOpen}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { minWidth: 220, background: '#181818', color: 'white', p: 1 } }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { createNewChat(); handlePopoverClose(); }}
            sx={{
              width: '100%',
              mb: 1,
              backgroundColor: '#282828',
              '&:hover': { backgroundColor: '#1e1e1e' },
            }}
          >
            New Chat
          </Button>
          <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'transparent' }}>
            {chats.map((chat) => (
              <ListItem
                key={chat.id}
                secondaryAction={
                  chats.length > 1 && (
                    <IconButton edge="end" aria-label="delete" size="small" onClick={() => handleDeleteChat(chat.id)} sx={{ color: '#ff5555' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )
                }
                onClick={() => { setCurrentChatId(chat.id); handlePopoverClose(); }}
                sx={{
                  borderRadius: '5px',
                  mb: '2px',
                  cursor: 'pointer',
                  backgroundColor: chat.id === currentChatId ? '#282828' : 'transparent',
                  color: chat.id === currentChatId ? 'white' : 'inherit',
                  '&:hover': { backgroundColor: chat.id === currentChatId ? '#282828' : '#232323' },
                  minHeight: 36,
                }}
              >
                <ListItemText 
                  primary={chat.title}
                  primaryTypographyProps={{
                    style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 15 }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Popover>
      </div>

      {/* Chat Area (no sidebar) */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', marginLeft: 0 }}>
        <div 
          ref={chatAreaRef} 
          className="promptbin-chat-area" 
          style={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', marginBottom: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', display: 'flex', flexDirection: 'column' }}
        >
          {currentChat.messages.map((msg) => (
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
                  borderColor: '#800080',
                  boxShadow: '0 0 8px 2px rgba(128, 0, 128, 0.3)',
                },
              },
              '& .MuiInputBase-input': {
                padding: '10px 14px',
                color: 'white',
                fontFamily: 'Inter, sans-serif',
              },
              '& ::placeholder': {
                color: '#a9a9a9',
                opacity: 1,
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
              minHeight: '44px',
              height: '44px',
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </main>
  )
}

export default PromptBin