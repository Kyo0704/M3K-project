import axios from 'axios';

const fetchTravelLogs = async () => {
  try {
    //一号館のローカルサーバー
   const response = await axios.get('http://10.108.1.172:3000/travel_logs');
   //二号館のローカルサーバー
   //const response = await axios.get('http://10.200.4.200:3000/travel_logs');
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching travel logs:', error);
  }
};

useEffect(() => {
  fetchTravelLogs();
}, []);