import { IProfile, Session, ImperativeError } from "@zowe/imperative";
import { ZosmfSession } from "@zowe/zosmf-for-zowe-sdk";
import { getDefaultProfile } from "@zowe/core-for-zowe-sdk";
import { GetJobs, IJob } from "@zowe/zos-jobs-for-zowe-sdk";
import * as express from "express";
import * as cors from "cors";

const POLLING_INTERVAL_MS = 5000;

const getJobsForCurrentUser = async () => {
    // Get the default z/OSMF profile and create a z/OSMF session with it
    let defaultZosmfProfile: IProfile;
    try {
        defaultZosmfProfile = await getDefaultProfile("zosmf", true);
    } catch (err) {
        throw new ImperativeError({msg: "Failed to get a profile."});
    }

    // Job Options
    const owner: string = defaultZosmfProfile.user;
    const session: Session = ZosmfSession.createBasicZosmfSession(defaultZosmfProfile);
    const response: IJob[] = await GetJobs.getJobsByOwner(session, owner);
    return response;
}

const app = express();
app.use(cors());

const port = process.env.PORT || 8000;
const server = app.listen(port, () => console.log(`App listening on port ${port}`));
let io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let clients = [];

let interval;
io.on("connection", (socket) => {
    console.log(`Connection received: ${socket}`);
    if (clients.length == 0) {
        console.log("First client connected")
        interval = setInterval(() => getApiAndEmit(socket), POLLING_INTERVAL_MS);
    }
    clients.push(socket);
    socket.on('disconnect', () => {
        console.log(`Connection disconnected: ${socket}`);
        const dcIndex = clients.findIndex(e => e === socket);
        clients.splice(dcIndex, 1);
        if (clients.length == 0) {
            console.log("No more clients left");
            clearInterval(interval);
        }
    })
})
const getApiAndEmit = async (socket) => {
    const response = (await getJobsForCurrentUser());
        // .filter(j => j.status !== 'OUTPUT');
    socket.emit("FromAPI", response);
}
