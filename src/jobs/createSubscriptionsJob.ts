import { Job } from "../util/job";
import { NgsiClient } from "../util/clients/ngsiClient";
import { StreamGroups } from "../models/streamGroups";

export class CreateSubscriptionsJob extends Job {
    constructor() {
        super('CreateSubscriptionsJob', '0 */5 * * * *');
    }

    protected async execute(): Promise<void> {
        // Get groups which contain streams without subscription (and return only those streams)
        const streamGroups = await StreamGroups.Model.aggregate([
            { $match: { 'streams': { $elemMatch: { subscriptionId: { $exists: false } } } } },
            { $unwind: '$streams' },
            { $match: { 'streams.subscriptionId': { $exists: false } } },
            { $group: { _id: '$_id', streams: { $push: '$streams' } } }
        ]).exec() as { _id: string; streams: StreamGroups['streams'] }[];

        if (streamGroups.length === 0) { return; }

        // Create subscriptions for the Stream Observations
        const streamIds = ([] as string[]).concat(...streamGroups.map(g => g.streams.map(s => s._id)));
        const subscription = await NgsiClient.Instance.createStreamObservationSubscription(streamIds);

        // Update Streams with the new SubscriptionId
        await StreamGroups.Model.updateMany(
            { '_id': { $in: streamGroups.map(g => g._id) } },
            { $set: { 'streams.$[stream].subscriptionId': subscription.id } },
            {
                arrayFilters: [
                    { 'stream._id': { $in: streamIds } }
                ]
            }
        ).exec();
    }
}