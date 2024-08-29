import { StatusBar } from 'expo-status-bar';
import Auth from './Auth';

export default function App() {
  return (
    <>
      <Auth />
      <StatusBar style="auto" />
    </>
  );
}