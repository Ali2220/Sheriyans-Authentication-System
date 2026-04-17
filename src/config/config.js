import dotenv from 'dotenv';
dotenv.config();

if(!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
}

if(!process.env.JWT_SECRET_KEY){
    throw new Error('JWT_SECRET is not defined in environment variables')
}

const config = {
    MONGO_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET_KEY
}

export default config