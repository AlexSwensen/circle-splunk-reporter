# circle-splunk-reporter

A package to report statistics about circle jobs to splunk.

This package depends on the following environment variables to be set:

```
CIRCLE_TOKEN - circleci user token that has access to the project you are reporting
SPLUNK_URL - your splunk url
SPLUNK_TOKEN - splunk  token
```

The rest of the environment variables are provided by CircleCI

In order to use:

```bash
$ npx @alexswensen/circle-splunk-reporter --name "event name" --index "splunk-index"
```
