import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Button, TextInput } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

const MY_IP = "127.0.0.1";

export default function App() {
  const [conStatus, setConStatus] = useState(false);
  const connection = useRef(new WebSocket(`ws://${MY_IP}:3000/`)); //Socket to home server
  const sockets = useRef(new Map()); //Map to all out going clients
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");


  //Setting up web socket
  useEffect(() => {
    connection.current.onopen = () => {
      setConStatus(true); 

      //Sending authentication homeSocket
      connection.current.send(JSON.stringify({
        usename: "username",
        password: "password"
      }));
    };

    connection.current.onclose = () => {
      setConStatus(false);
    };

    connection.current.onmessage = (message) => {

    };
  }, []);

  const sendMessage = () => {
    if(conStatus) {
      //First we want to open connection to the person     
      const IP_ADDER = address.trim(); 
      let socketConnection = null;
      if(sockets.current.get(IP_ADDER) == null) {
        socketConnection = new WebSocket(`ws://${IP_ADDER}:3000/`);

        socketConnection.onopen = () => {
          sockets.current.set(IP_ADDER, socketConnection);
        };

        socketConnection.onclose = () => {
          sockets.current.delete(IP_ADDER);
        }
      } else {
        socketConnection = sockets.current.get(IP_ADDER);
      }

      //Now we send 
      if(socketConnection.readyState == 1) {
        socketConnection.send(JSON.stringify({
          type: "MESSAGE",
          to: IP_ADDER,
          from: MY_IP,
          message: message
        }));
      }

      //Update to server
      connection.current.send(JSON.stringify({
        type: "UPDATE",
        to: IP_ADDER,
        from: MY_IP,
        message: message
      }));
    }
 };
  



  return (
    <View style={styles.container}>
      <Text>Address:</Text>
      <TextInput
        value={address}
        onChange={setAddress}
      />
      <Text>Message: </Text>
      <TextInput 
        value={message}
        onChange={setMessage}
      />
      <Button onPress={sendMessage}>Send Message</Button>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});