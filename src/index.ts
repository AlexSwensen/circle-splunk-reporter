#!/usr/bin/env node
import chalk from "chalk";
import fetch, { RequestInit } from "node-fetch";
import { SplunkSender } from "./SplunkSender";
import yargs from "yargs";

const argv = yargs(process.argv.slice(2))
  .scriptName("metrics-to-splunk")
  .usage("$0 [args]")
  .options({
    name: {
      alias: "n",
      describe: "name of the splunk event to emit",
      demandOption: true,
      type: "string",
    },
    index: {
      alias: "i",
      describe: "splunk index to log to",
      demandOption: false,
      type: "string",
    },
  })
  .help().argv;
console.log(argv);

const CIRCLECI = process.env.CIRCLECI;
if (!CIRCLECI) {
  console.log(
    chalk.redBright(
      "This utility is designed to be run in CircleCI. Running outside of CircleCI could return unexpected results."
    )
  );
}

const name = argv.name || undefined;
const index = argv.index || undefined;

if (!name) {
  console.log(chalk.redBright("You must pass in --name"));
  process.exit(1);
}

async function main() {
  const currentTime = new Date();

  const splunkURL = process.env.SPLUNK_URL as string;
  const splunkToken = process.env.SPLUNK_TOKEN as string;

  const result = await (await fetchCircleBuildStats()).json();
  console.log(result);

  const logger = new SplunkSender({
    url: splunkURL,
    token: splunkToken,
    ssl: true,
  });
  logger.send(
    {
      name: name as string,
      data: {
        circleJob: result,
        currentTime: currentTime.toISOString(),
      },
      index: index as string,
    },
    () => {}
  );
}

export async function fetchCircleBuildStats() {
  /**
   * All of these are already available in a CircleCI build.
   */
  const repoURL = process.env.CIRCLE_REPOSITORY_URL as string;
  const circleProjectUsername = process.env.CIRCLE_PROJECT_USERNAME;
  const circleProjectReponame = process.env.CIRCLE_PROJECT_REPONAME;
  const jobNumber = process.env.CIRCLE_BUILD_NUM;

  let VCSProvider;

  // determine if this is a github or bitbucket repo
  if (repoURL?.includes("github")) {
    VCSProvider = "gh";
  } else {
    VCSProvider = "bb";
  }

  const projectSlug = `${VCSProvider}/${circleProjectUsername}/${circleProjectReponame}`;

  var requestOptions: RequestInit = {
    method: "GET",
    redirect: "follow",
  };

  const circleToken = process.env.CIRCLE_TOKEN;

  const url = `https://circleci.com/api/v2/project/${projectSlug}/job/${jobNumber}?circle-token=${circleToken}`;
  console.log(url);

  const result = await fetch(url, requestOptions);
  return result;
}

if (require?.main === module) {
  main();
}
