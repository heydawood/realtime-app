import React from 'react'

const page = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-chat">
      <div className="text-center">
        <h2 className="text-xl font-medium">
          Select a chat to start messaging
        </h2>

        <p className="text-muted-foreground mt-2">
          Or start a new conversation
        </p>
      </div>
    </div>
  );
}

export default page