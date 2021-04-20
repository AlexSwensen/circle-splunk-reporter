#!/usr/bin/env node
import chalk from "chalk";
import Circle from "@alexswensen/circleci-api";
import { SplunkSender } from "./SplunkSender";
import yargs from "yargs";
import { ICircleCIJob } from "./types";
import { DateTime } from "luxon";
import { VCSProvider } from "@alexswensen/circleci-api/dist/utils/vcs";

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
  const splunkURL = process.env.SPLUNK_URL as string;
  const splunkToken = process.env.SPLUNK_TOKEN as string;
  const result = (await (await fetchCircleBuildStats()).json()) as ICircleCIJob;

  const currentTime = DateTime.local();
  const startedTime = DateTime.fromISO(result.started_at);
  const duration = currentTime.diff(startedTime);
  const durationVal = duration.as("milliseconds");

  try {
    const logger = new SplunkSender({
      url: splunkURL,
      token: splunkToken,
      loggerOptions: {
        strictSSL: true,
        timeout: 15, // in seconds
      },
    });

    const payload = {
      name: name as string,
      data: {
        circleJob: result,
        currentTime: currentTime.toISO(),
        duration: durationVal,
      },
      index: index as string,
    };

    console.log("Sending to spunk...");

    console.log(JSON.stringify(payload));

    logger.send(payload, () => {});
  } catch (err) {
    throw new Error(err);
  }
}

export async function fetchCircleBuildStats(): Promise<Response> {
  /**
   * All of these are already available in a CircleCI build.
   */
  const repoURL = process.env.CIRCLE_REPOSITORY_URL as string;
  const circleProjectUsername = process.env.CIRCLE_PROJECT_USERNAME as string;
  const circleProjectReponame = process.env.CIRCLE_PROJECT_REPONAME;
  const jobNumber = process.env.CIRCLE_BUILD_NUM as string;

  const circleToken = process.env.CIRCLE_TOKEN as string;

  let vcs;

  // determine if this is a github or bitbucket repo
  if (repoURL?.includes("github")) {
    vcs = VCSProvider.github;
  } else {
    vcs = VCSProvider.bitbucket;
  }

  const circle = Circle.init({
    token: circleToken,
    orgName: circleProjectUsername,
    repoName: circleProjectReponame,
    vcs: vcs,
  });

  const result = await circle.job.get(parseInt(jobNumber));
  return result;
}

if (require?.main === module) {
  main();
}
