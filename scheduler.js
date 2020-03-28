const { CronJob } = require("cron");

const remoteJobsScrapper = require("./remotejobs-scraper");

console.log("Scheduler Started");
const fetchRemoteJobsJob = new CronJob("* * * * *", async () => {
  console.log("Fetching new Remote Jobs...");
  await remoteJobsScrapper.run();
  console.log("Jobs: ", jobs);
});
fetchRemoteJobsJob.start();
