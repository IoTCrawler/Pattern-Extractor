import { Job } from "../util/job";
import { EventMapping } from "../models/eventMapping";
import { NgsiClient } from "../util/clients/ngsiClient";

export class DeleteExpiredEventsJob extends Job {
    constructor() {
        super('DeleteExpiredEvents', ['30 2-59/5 * * * *']);
    }

    protected async execute(): Promise<void> {
        const expiryDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const query = { timestamp: { $lt: expiryDate } };
        const result = await EventMapping.Model.find(query, { _id: 1 }).exec();
        if (result.length > 0) {
            await Promise.all([
                EventMapping.Model.deleteMany(query).exec(),
                NgsiClient.Instance.bulkDeleteEntities(result.map(x => x._id))
            ]);
        }
    }
}