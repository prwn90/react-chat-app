import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//Initialize Firebase
firebase.initializeApp({
  //Copy your Firebase API config here
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
        <header>
          <h1>⚛️REACT CHAT APP⚛️</h1>
          <SignOut />
        </header>

        <section>
          {user ? <ChatRoom /> : <SignIn />}
        </section>

    </div>
  );
}

//Sign In function 
function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Your Google account!</button>
      <h4>We invite you to chat! 🙂</h4>
    </>
  )
}

//Sign Out function
function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out!</button>
  )
}

//Chats funtions 
function ChatRoom() {

  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  //Send message
  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }


return (
<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

    <span ref={dummy}></span>

    </main>

 <form onSubmit={sendMessage}>

    <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Write something..." />

    <button type="submit" disabled={!formValue}>SEND💬</button>

</form>  
</>
 )
}

//Chat messages function
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
  <>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/55/user@adorable.io.png'} />
      <p>{text}</p>
    </div>
  </>
  )
}

export default App;
