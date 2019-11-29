import { CronJob, CronJobParameters } from "cron";
import * as moment from "moment";

type CronTime = string | Date | moment.Moment;

export abstract class Job {
    protected readonly name: string;
    private readonly job: CronJob[];
    private readonly nextDate: moment.Moment[] = [];

    constructor(name: string, cronTime: CronTime | CronTime[]) {
        this.name = name;

        this.job = ([] as CronTime[]).concat(cronTime).map((t, i) => {
            const params: CronJobParameters = {
                cronTime: t,
                onTick: this.executeWrapper.bind(this, i),
                onComplete: () => console.warn(`[${name}#${i}] CronJob has stopped`)
            };

            return new CronJob(params);
        });
    }

    public executeWrapper(jobIndex: number): void {
        try {
            this.nextDate.shift();

            this.execute().then(() => {
                this.nextDate.push(this.job[jobIndex].nextDate());
                this.nextDate.sort();
                const nextDate = this.nextDate[0];

                console.log(`[${this.name}] CronJob completed succesfullly at ${this.job[jobIndex].lastDate().toISOString()}, next run ${nextDate.toISOString()}`)
            }).catch(e => {
                console.error(`[${this.name}] CronJob failed at ${this.job[jobIndex].lastDate().toISOString()}: ${e.message}`);
            });
        } catch (e) {
            console.error(`[${this.name}] CronJob failed at ${this.job[jobIndex].lastDate().toISOString()}: ${e.message}`);
        }
    }

    protected abstract async execute(): Promise<void>;

    public start(): void {
        this.job.forEach(j => {
            j.start();
            this.nextDate.push(j.nextDate());
        });

        this.nextDate.sort();
    }
}