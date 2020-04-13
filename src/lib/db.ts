import { MongoClientOptions, MongoClient } from "mongodb";

export interface IDatabaseModel {
    updateUser: (id: string, refreshToken: string, accessToken: string, cookie: string, src: string) => Promise<void>;
}

export default async (dbconnection: string, dbusername?: string, dbpassword?: string): Promise<IDatabaseModel> => {
    const connectionSetting: MongoClientOptions = {};
    if (dbusername !== undefined && dbpassword !== undefined) {
        connectionSetting.auth = { user: dbusername, password: dbpassword };
    }
    const client = new MongoClient(dbconnection, connectionSetting);
    const conn = await client.connect();
    return {
        updateUser: async (id: string, refreshToken: string, accessToken: string, cookie: string, src: string) => {
            const db = conn.db("compositecalendar");
            const currentTime = new Date().getTime();

            await db.collection("accounts").updateOne(
                { id },
                { $set: { id, refreshToken, accessToken, lastupdate: currentTime, lastrefresh: currentTime } },
                { upsert: true },
            );
            await db.collection("sessions").insertOne({ cookie, src, currentTime, id });

        },
    };
};
