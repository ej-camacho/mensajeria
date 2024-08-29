import { StatusBar } from 'expo-status-bar';
// import CreateUser from './CreateUser';
import Auth from './Auth';

export default function App() {
  return (
    <>
      {/* <CreateUser /> */}
      <Auth />
      <StatusBar style="auto" />
    </>
  );
}