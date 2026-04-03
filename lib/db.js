import mongoose from 'mongoose';
import dns from 'dns';

const MONGODB_URI = process.env.MONGO_URI;

dns.setServers(['8.8.8.8', '8.8.4.4']);

const ConnectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('MongoDB server connected successfully')
    } catch (error) {
        console.log(error)
        console.log('Failed to connect mongodb')
    }
}

export default ConnectDB