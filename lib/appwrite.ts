import { Account, Client, TablesDB } from 'react-native-appwrite';

export const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME!);

export const account = new Account(client);

export const tablesDB = new TablesDB(client);
export const DATABASE_ID = process.env.EXPO_PUBLIC_DB_ID!;
export const HABITS_TABLE_ID = process.env.EXPO_PUBLIC_HABITS_TABLE!;
export const COMPLETION_TABLE_ID = process.env.EXPO_PUBLIC_COMPLETION_TABLE!;

export interface RealTimeResponse {
  events: string[];
  payload: any;
}
