const puppeteer = require("puppeteer");

let jobs = [];

module.exports.run = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://remoteok.io");

  await loadLatestJobs(page);
  console.log("Latest Jobs: ", jobs);

  await browser.close();
};

module.exports.getJobs = () => jobs;

function addJob(title, company, ...technologies) {
  if (jobs) {
    const job = { title, company, technologies };
    jobs.push(job);
  }
}

async function getPropertyValue(element, propertyName) {
  const property = await element.getProperty(propertyName);
  return await property.jsonValue();
}

async function loadLatestJobs(page) {
  jobs = [];

  const todaysJobsBody = await page.$("tbody");
  const bodyRows = await todaysJobsBody.$$("tr");

  const rowsMapping = bodyRows.map(async row => {
    const jobTitleElement = await row.$("[itemprop=title]");
    if (jobTitleElement) {
      const titleValue = await getPropertyValue(jobTitleElement, "innerText");
      const hiringOrganization = await row.$("[itemprop=hiringOrganization]");
      let organizitionName = "";
      let technologies = [];
      if (hiringOrganization) {
        organizitionName = await getPropertyValue(
          hiringOrganization,
          "innerText"
        );
      }
      const tags = await row.$$(".tag");
      technologies = await Promise.all(
        tags.map(async tag => {
          const tagContent = await tag.$("h3");
          return (
            await getPropertyValue(tagContent, "innerText")
          ).toLowerCase();
        })
      );
      //Remove all duplicates
      technologies = [...new Set(technologies)];
      //Add new Job
      addJob(titleValue, organizitionName, ...technologies);
    }
  });
  await Promise.all(rowsMapping);
}

module.exports.run();
