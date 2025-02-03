# What is this?

A repo containing GitHub Actions which can be used to integrate your builds with https://monitor-everything.online

# Inputs

### `token`

Optional, depending on the command. The security token to use when executing the action. Used in the communication with https://monitor-everything.online and is associated with your organisation and application. If the token is wrong or has expired,
the action will result in an error, as it is not able to communicate securely with the server.

### `command`

**Required** The command to execute. Must be one of the following.

- `BUILD_STARTED` - is used to record the time at which the build starts, and can be combined with `BUILD_COMPLETED` in order to monitor the time taken to execute a build for the application. Requires the `token` and `deploymentName` 
inputs to be set.

- `BUILD_COMPLETED` - is used in conjunction with `BUILD_STARTED` and should be executed at the end of the build script, and uploads the time taken for the build to execute. Only call this when the build is successful, otherwise partial builds will negatively affect the recorded time. Requires the `token` and `deploymentName` 
inputs to be set.

### `folderToStoreStateIn`

This action needs to store state in a file. That file needs to be present later during the job, and perhaps even when a
second job runs. Use this input parameter to name a folder that survives jobs.

### `deploymentName`

This provides the name of the deployment, component or application that is being built. This is used to identify the build in the monitor-everything.online UI. Its value might typically be based on the project and repository names, 
e.g. `myproject/myrepo` would have the deployment name `myproject-myrepo`.

# Example usage

```yaml
    steps:

      - name: record_start_of_build
        uses: maxant/monitor-everything.online@v0.0.15
        with:
          token: ${{secrets.MONITOR_EVERYTHING_ONLINE_TOKEN}}
          command: BUILD_STARTED
          folderToStoreStateIn: "/buildcache"
          deploymentName: "yourDeploymentOrComponentOrApplicationName"

      - ... other build steps

      # final build step - record the time taken by the build
      - name: record_end_of_successful_build
        uses: maxant/monitor-everything.online@v0.0.15
        with:
          token: ${{secrets.MONITOR_EVERYTHING_ONLINE_TOKEN}}
          command: BUILD_COMPLETED
          folderToStoreStateIn: "/buildcache"
          deploymentName: "yourDeploymentOrComponentOrApplicationName"

```

# Errors

- `MEOE-001 Missing context.startTime` - if this occurs, there is probably a bug in the action, please create an issue describing how you use the action so that we can investigate the cause.

- `MEOE-002 Missing context file ${contextFilename} - did you forget to run this action with the command 'BUILD_STARTED'?` - if this occurs, please ensure that you have called the action with the command 'BUILD_STARTED' in the same job as calling the action with the command 'BUILD_COMPLETED'.
- `MEOE-003 Unknown command ${command}` - This happens if you are calling the action with an unknown command. Please read about the supported commands above in the "inputs" section.
- `MEOE-004 General error: ${error.message}` - This indicates that a general error has occurred. Please open an issue and describe how you use the action so that we can investigate the cause.
- `MEOE-005 Failed to POST build time to url` - This indicates that there was an error uploading the build time. Please open an issue and describe how you use the action so that we can investigate the cause.
- `MEOE-006 Missing deploymentName` - You need to add the `deploymentName` input paramter under the `with` block of the action for the BUILD_COMPLETED command.
- `MEOE-007 Missing deploymentName` - You need to add the `deploymentName` input paramter under the `with` block of the action for the BUILD_STARTED command.
- `MEOE-008 Failed to POST build time to url` - This indicates that there was an error uploading the commit IDs as part of the `BUILD_STARTED` command. Please open an issue and describe how you use the action so that we can investigate the cause.
