import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        'MONGODB_URI is missing. Set it in Render Environment Variables.'
      );
    }

    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      throw new Error(
        'Invalid MONGODB_URI format. Must start with mongodb:// or mongodb+srv://'
      );
    }

    const conn = await mongoose.connect(uri, {
      family: 4, // Force IPv4 (important on Render)
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error('[MongoDB] Connection failed:', error.message);
    process.exit(1);
  }
};
