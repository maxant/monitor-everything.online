# What is this?

A repo containing GitHub Actions which can be used to integrate your builds with https://monitor-everything.online

## Inputs

### `token`

**Required** The security token to use when executing the action. Used in the communication with https://monitor-everything.online and is associated with your organisation and application. If the token is wrong or has expired,
the action will result in an error, as it is not able to communicate securely with the server.

### `command`

**Required** The command to execute. Must be one of the following.

- `BUILD_STARTED` - is used to record the time at which the build starts, and can be combined with `BUILD_COMPLETED` in order to monitor the time taken to execute a build for the application.

- `BUILD_COMPLETED` - is used in conjunction with `BUILD_STARTED` and should be executed at the end of the build script, and uploads the time taken for the build to execute. Only call this when the build is successful, otherwise partial builds will negatively affet the recorded time. Requires the following context inputs:
  - `starttime` the value taken from the step with called the action with the command `BUILD_STARTED`, e.g.: `context: '{"starttime": "${{steps.record_start_of_build.outputs.starttime}}" }'`. The examples below show more details.


- `CHANGE_COMMITED` - is used to log that a change has been committed and is relevant for the Dora metric "lead time for changes" as it is used to measure the first commit on a branch (related to a change).

- `CHANGE_DEPLOYED_TO_PROD` - is used to measure the number of deployments, but also to mark the end of a "lead time for change" measurement. Can be called multiple times for the same change, which simply causes the measured time to be extended.

### `context`

**Optional** A map of command specific inputs. Each command described above describes the required context parameters.

## Example usage

```yaml
    steps:

      - name: record_start_of_build
        uses: maxant/monitor-everything.online
        with:
          token: ${{secrets.MONITOR_EVERYTHING_ONLINE_TOKEN}}
          command: BUILD_STARTED

      - ... other build steps

      # final build step - record the time taken by the build
      - name: record_end_of_successful_build
        uses: maxant/monitor-everything.online
        with:
          token: ${{secrets.MONITOR_EVERYTHING_ONLINE_TOKEN}}
          command: BUILD_COMPLETED
          context: '{"starttime": "${{steps.record_start_of_build.outputs.starttime}}" }'

```