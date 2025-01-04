# What is this?

A repo containing GitHub Actions which can be used to integrate your builds with https://monitor-everything.online

## Inputs

### `token`

**Required** The security token to use when executing the action. Used in the communication with https://monitor-everything.online and is associated with your organisation and application. If the token is wrong or has expired,
the action will result in an error, as it is not able to communicate securely with the server.

### `command`

**Required** The command to execute. Must be one of the following.

- `BUILD_STARTED` - is used to record the time at which the build starts, and can be combined with `BUILD_COMPLETED` in order to monitor the time taken to execute a build for the application.
- `BUILD_COMPLETED` - is used in conjunction with `BUILD_STARTED` and should be executed at the end of the build script, and uploads the time taken for the build to execute. Only call this when the build is successful, otherwise partial builds will negatively affet the recorded time.
- `CHANGE_COMMITED` - is used to log that a change has been committed and is relevant for the Dora metric "lead time for changes" as it is used to measure the first commit on a branch (related to a change).
- `CHANGE_DEPLOYED_TO_PROD` - is used to measure the number of deployments, but also to mark the end of a "lead time for change" measurement. Can be called multiple times for the same change, which simply causes the measured time to be extended.

## Outputs

- `context` - an object that can be passed to another call to the action later in the build, e.g. pass this object whcih you receive when running the command `BUILD_STARTED` to the action when running the command `BUILD_COMPLETED` as it 
contains state required by the second command in order to complete the measurement.

## Example usage

```yaml
uses: actions/maxant/monitor-everything.online
with:
  token: {{secrets.MEO_TOKEN}}
  command: "BUILD_STARTED"
```