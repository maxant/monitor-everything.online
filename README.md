# What is this?

A repo containing GitHub Actions which can be used to integrate your builds with https://monitor-everything.online

# Inputs

### `token`

Optional, depending on the command. The security token to use when executing the action. Used in the communication with https://monitor-everything.online and is associated with your organisation and application. If the token is wrong or has expired,
the action will result in an error, as it is not able to communicate securely with the server.

### `command`

**Required** The command to execute. Must be one of the following.

- `BUILD_STARTED` - is used to record the time at which the build starts, and can be combined with `BUILD_COMPLETED` in order to monitor the time taken to execute a build for the application. Does not require the `token` input to be set.

- `BUILD_COMPLETED` - is used in conjunction with `BUILD_STARTED` and should be executed at the end of the build script, and uploads the time taken for the build to execute. Only call this when the build is successful, otherwise partial builds will negatively affect the recorded time. Requires that the `token` input is set.

- `CHANGE_COMMITED` - is used to log that a change has been committed and is relevant for the Dora metric "lead time for changes" as it is used to measure the first commit on a branch (related to a change). Requires that the `token` input is set.

- `CHANGE_DEPLOYED_TO_PROD` - is used to measure the number of deployments, but also to mark the end of a "lead time for change" measurement. Can be called multiple times for the same change, which simply causes the measured time to be extended. Requires that the `token` input is set.

### `folderToStoreStateIn`

This action needs to store state in a file. That file needs to be present later during the job, and perhaps even when a
second job runs. Use this input parameter to name a folder that survives jobs.

# Example usage

```yaml
    steps:

      - name: record_start_of_build
        uses: maxant/monitor-everything.online@v0.0.14
        with:
          command: BUILD_STARTED

      - ... other build steps

      # final build step - record the time taken by the build
      - name: record_end_of_successful_build
        uses: maxant/monitor-everything.online@v0.0.14
        with:
          token: ${{secrets.MONITOR_EVERYTHING_ONLINE_TOKEN}}
          command: BUILD_COMPLETED

```

# Errors

- `MEOE-001 Missing context.startTime` - if this occurs, there is probably a bug in the action, please create an issue describing how you use the action so that we can investigate the cause.

- `MEOE-002 Missing context file ${contextFilename} - did you forget to run this action with the command 'BUILD_STARTED'?` - if this occurs, please ensure that you have called the action with the command 'BUILD_STARTED' in the same job as calling the action with the command 'BUILD_COMPLETED'.
- `MEOE-003 Unknown command ${command}` - This happens if you are calling the action with an unknown command. Please read about the supported commands above in the "inputs" section.
- `MEOE-004 General error: ${error.message}` - This indicates that a general erro rhas occurred. Please open an issue and describe how you use the action so that we can investigate the cause.
