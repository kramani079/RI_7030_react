import mongoose from 'mongoose';

const connectDB = async () => {
  let retries = 5;
  while (retries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      break;
    } catch (err) {
      console.error(`❌ MongoDB Connection Error: ${err.message}`);
      retries -= 1;
      console.log(`⏳ Retries left: ${retries}. Waiting 5 seconds...`);
      await new Promise(res => setTimeout(res, 5000));
      if (retries === 0) {
        console.error('💥 Could not connect to MongoDB. Exiting...');
        process.exit(1);
      }
    }
  }
};

export default connectDB;
